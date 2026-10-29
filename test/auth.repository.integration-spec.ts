import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import type { TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { AuthRepository } from '../src/auth/auth.repository';
import { DatabaseModule } from '../src/database/database.module';
import { DataBaseService } from '../src/database/database.service';
import { validateEnvironment } from '../src/config/env.validation';
import { PasswordHasherService } from '../src/auth/password-hasher.service';

describe('AuthRepository — integración', () => {
  let module: TestingModule | undefined;
  let repository: AuthRepository;
  let database: DataBaseService;
  let passwordHasher: PasswordHasherService;

  beforeAll(async () => {
    const connectionString = process.env.DATABASE_URL;

    if (
      connectionString === undefined ||
      new URL(connectionString).pathname !== '/house_test'
    ) {
      throw new Error('Las pruebas requieren DATABASE_URL hacia house_test');
    }

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          validate: validateEnvironment,
        }),
        DatabaseModule,
      ],
      providers: [AuthRepository, PasswordHasherService],
    }).compile();

    await module.init();

    repository = module.get(AuthRepository);
    database = module.get(DataBaseService);
    passwordHasher = module.get(PasswordHasherService);

    const result = await database.pool.query<{ database: string }>(
      'SELECT current_database() AS database',
    );

    if (result.rows[0]?.database !== 'house_test') {
      throw new Error('La conexión real no corresponde a house_test');
    }
  });

  afterAll(async () => {
    await module?.close();
  });

  it('revierte el usuario si falla la creación de su credencial', async () => {
    const email = `rollback-${randomUUID()}@example.com`;

    try {
      await expect(
        repository.createUserWithPassword({
          email,
          displayName: 'Prueba de rollback',
          passwordHash: '',
        }),
      ).rejects.toMatchObject({
        code: '23514',
        constraint: 'password_credentials_hash_not_blank',
      });

      const result = await database.pool.query(
        'SELECT id FROM app.users WHERE email = $1',
        [email],
      );

      expect(result.rows).toHaveLength(0);
    } finally {
      await database.pool.query('DELETE FROM app.users WHERE email = $1', [
        email,
      ]);
    }
  });

  it('guarda el usuario y una credencial que verifica su contraseña', async () => {
    const email = `register-${randomUUID()}@example.com`;
    const password = 'Una contraseña ficticia de prueba';
    const passwordHash = await passwordHasher.hash(password);

    try {
      const result = await repository.createUserWithPassword({
        email,
        displayName: 'Usuario de prueba',
        passwordHash,
      });

      expect(result.ok).toBe(true);

      if (!result.ok) {
        throw new Error('Se esperaba la creación del usuario');
      }

      const stored = await database.pool.query<{
        id: string;
        display_name: string;
        password_hash: string;
      }>(
        `
        SELECT u.id, u.display_name, c.password_hash
        FROM app.users AS u
        JOIN app.password_credentials AS c ON c.user_id = u.id
        WHERE u.email = $1
      `,
        [email],
      );

      expect(stored.rows).toHaveLength(1);

      const row = stored.rows[0];

      if (row === undefined) {
        throw new Error('No se encontró el usuario con su credencial');
      }

      expect(row.id).toBe(result.user.id);
      expect(row.display_name).toBe('Usuario de prueba');
      expect(row.password_hash).toBe(passwordHash);
      expect(await passwordHasher.verify(row.password_hash, password)).toBe(
        true,
      );
    } finally {
      await database.pool.query('DELETE FROM app.users WHERE email = $1', [
        email,
      ]);
    }
  });

  it('rechaza el email duplicado sin modificar el usuario ni su credencial', async () => {
    const email = `duplicate-${randomUUID()}@example.com`;

    const password = 'Una contraseña ficticia original';
    const newPassword = 'Otra contraseña ficticia diferente';

    const passwordHash = await passwordHasher.hash(password);
    const passwordNewHash = await passwordHasher.hash(newPassword);

    try {
      const result = await repository.createUserWithPassword({
        displayName: 'Nombre Original',
        email,
        passwordHash,
      });

      expect(result.ok).toBe(true);

      if (!result.ok) {
        throw new Error('Se esperaba la creación del usuario');
      }

      const duplicatedResult = await repository.createUserWithPassword({
        displayName: 'Nombre Nuevo',
        email,
        passwordHash: passwordNewHash,
      });

      expect(duplicatedResult).toEqual({
        ok: false,
        reason: 'EMAIL_ALREADY_EXISTS',
      });

      const stored = await database.pool.query<{
        id: string;
        display_name: string;
        password_hash: string;
      }>(
        `
        SELECT u.id, u.display_name, c.password_hash
        FROM app.users AS u
        JOIN app.password_credentials AS c ON c.user_id = u.id
        WHERE u.email = $1
      `,
        [email],
      );

      expect(stored.rows).toHaveLength(1);

      const row = stored.rows[0];

      if (row === undefined) {
        throw new Error('No se encontró el usuario con su credencial');
      }

      expect(row.id).toBe(result.user.id);
      expect(row.display_name).toBe('Nombre Original');
      expect(row.password_hash).toBe(passwordHash);
      expect(await passwordHasher.verify(row.password_hash, newPassword)).toBe(
        false,
      );
    } finally {
      await database.pool.query('DELETE FROM app.users WHERE email = $1', [
        email,
      ]);
    }
  });
});
