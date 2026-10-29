import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from '@jest/globals';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataBaseService } from '../src/database/database.service';
import { PasswordHasherService } from '../src/auth/password-hasher.service';

type StoredAccount = {
  id: string;
  email: string;
  display_name: string;
  email_verified_at: Date | null;
  password_hash: string;
};

describe('Registro de usuarios (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let database: DataBaseService;
  let passwordHasher: PasswordHasherService;

  const testEmails = new Set<string>();

  function createTestEmail(): string {
    const email = `e2e-${randomUUID()}@example.com`;
    testEmails.add(email);
    return email;
  }

  async function findAccounts(email: string): Promise<StoredAccount[]> {
    const result = await database.pool.query<StoredAccount>(
      `
        SELECT
          u.id,
          u.email,
          u.display_name,
          u.email_verified_at,
          c.password_hash
        FROM app.users AS u
        JOIN app.password_credentials AS c ON c.user_id = u.id
        WHERE u.email = $1
      `,
      [email],
    );

    return result.rows;
  }

  beforeAll(async () => {
    const connectionString = process.env.DATABASE_URL;

    if (
      connectionString === undefined ||
      new URL(connectionString).pathname !== '/house_test'
    ) {
      throw new Error('Los tests e2e requieren la base house_test');
    }

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    database = app.get(DataBaseService);
    passwordHasher = app.get(PasswordHasherService);

    const result = await database.pool.query<{ database: string }>(
      'SELECT current_database() AS database',
    );

    if (result.rows[0]?.database !== 'house_test') {
      throw new Error('La conexión real no corresponde a house_test');
    }
  });

  afterEach(async () => {
    if (testEmails.size === 0) {
      return;
    }

    await database.pool.query(
      'DELETE FROM app.users WHERE email = ANY($1::text[])',
      [[...testEmails]],
    );

    testEmails.clear();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('mantiene disponible el endpoint inicial', async () => {
    await request(app!.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('normaliza y registra una cuenta sin devolver datos sensibles', async () => {
    const email = createTestEmail();
    const password = 'Una contraseña ficticia original';

    await request(app!.getHttpServer())
      .post('/auth/register')
      .send({
        email: `  ${email.toUpperCase()}  `,
        displayName: '  Roberto  ',
        password,
      })
      .expect(202)
      .expect({
        message: 'Solicitud de registro procesada',
      });

    const accounts = await findAccounts(email);

    expect(accounts).toHaveLength(1);

    const account = accounts[0];

    if (account === undefined) {
      throw new Error('No se encontró la cuenta registrada');
    }

    expect(account.email).toBe(email);
    expect(account.display_name).toBe('Roberto');
    expect(account.email_verified_at).toBeNull();
    expect(account.password_hash).not.toBe(password);

    expect(await passwordHasher.verify(account.password_hash, password)).toBe(
      true,
    );
  });

  it('responde igual ante un duplicado y conserva la cuenta original', async () => {
    const email = createTestEmail();
    const password = 'Una contraseña ficticia original';
    const newPassword = 'Otra contraseña ficticia diferente';

    const originalResponse = await request(app!.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        displayName: 'Nombre Original',
        password,
      })
      .expect(202);

    const originalAccounts = await findAccounts(email);
    expect(originalAccounts).toHaveLength(1);

    const original = originalAccounts[0];

    if (original === undefined) {
      throw new Error('No se encontró la cuenta original');
    }

    const duplicateResponse = await request(app!.getHttpServer())
      .post('/auth/register')
      .send({
        email: email.toUpperCase(),
        displayName: 'Nombre que no debe guardarse',
        password: newPassword,
      })
      .expect(202);

    expect(duplicateResponse.body).toEqual(originalResponse.body);
    expect(duplicateResponse.body).toEqual({
      message: 'Solicitud de registro procesada',
    });

    const accounts = await findAccounts(email);
    expect(accounts).toHaveLength(1);

    const account = accounts[0];

    if (account === undefined) {
      throw new Error('La cuenta original ha desaparecido');
    }

    expect(account.id).toBe(original.id);
    expect(account.display_name).toBe('Nombre Original');
    expect(account.password_hash).toBe(original.password_hash);

    expect(
      await passwordHasher.verify(account.password_hash, newPassword),
    ).toBe(false);
  });

  it.each([
    {
      name: 'email inválido',
      changes: { email: 'no-es-un-email' },
    },
    {
      name: 'email numérico',
      changes: { email: 42 },
    },
    {
      name: 'nombre vacío tras normalizar',
      changes: { displayName: '   ' },
    },
    {
      name: 'nombre de más de 100 caracteres',
      changes: { displayName: 'a'.repeat(101) },
    },
    {
      name: 'contraseña demasiado corta',
      changes: { password: 'a'.repeat(14) },
    },
    {
      name: 'contraseña demasiado larga',
      changes: { password: 'a'.repeat(129) },
    },
    {
      name: 'contraseña nula',
      changes: { password: null },
    },
    {
      name: 'propiedad no permitida',
      changes: { role: 'ADMIN' },
    },
  ])('rechaza $name sin crear usuarios', async ({ changes }) => {
    const email = createTestEmail();

    const payload = {
      email,
      displayName: 'Usuario de prueba',
      password: 'Una contraseña ficticia válida',
      ...changes,
    };

    // Registrar también un email inválido si se ha enviado como string,
    // para poder detectar y limpiar una inserción incorrecta.
    const candidateEmails = new Set([email]);

    if (typeof payload.email === 'string') {
      const normalizedEmail = payload.email.trim().toLowerCase();
      candidateEmails.add(normalizedEmail);
      testEmails.add(normalizedEmail);
    }

    await request(app!.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(400);

    const stored = await database.pool.query(
      'SELECT id FROM app.users WHERE email = ANY($1::text[])',
      [[...candidateEmails]],
    );

    expect(stored.rows).toHaveLength(0);
  });
});
