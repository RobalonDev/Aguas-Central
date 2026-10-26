import { Injectable, Logger } from '@nestjs/common';
import { DataBaseService } from '../database/database.service';
import { POSTGRES_ERROR_CODES } from '../database/postgres-errors';

type CreateUserWithPasswordInput = {
  email: string;
  displayName: string;
  passwordHash: string;
};

type CreatedUserRow = {
  id: string;
  email: string;
  display_name: string;
};

type CreateUserResult =
  | { ok: true; user: CreatedUserRow }
  | { ok: false; reason: 'EMAIL_ALREADY_EXISTS' };

const USER_CONSTRAINTS = {
  EMAIL_UNIQUE: 'users_email_unique',
} as const;

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly databaseService: DataBaseService) {}

  async createUserWithPassword(
    data: CreateUserWithPasswordInput,
  ): Promise<CreateUserResult> {
    const client = await this.databaseService.pool.connect();

    let discardClient = false;
    try {
      await client.query('BEGIN');

      const result = await client.query<CreatedUserRow>(
        `
            INSERT INTO app.users (email, display_name)
            VALUES ($1, $2)
            RETURNING id, email, display_name
        `,
        [data.email, data.displayName],
      );

      const user = result.rows[0];
      if (user === undefined) {
        throw new Error('La inserción del usuario no devolvió ninguna fila');
      }

      await client.query(
        `
            INSERT INTO app.password_credentials (user_id, password_hash)
            VALUES ($1, $2)
        `,
        [user.id, data.passwordHash],
      );

      await client.query('COMMIT');

      return { ok: true, user };
    } catch (error: unknown) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError: unknown) {
        discardClient = true;

        this.logger.error(
          'Falló el rollback de la transacción de registro',
          rollbackError instanceof Error ? rollbackError.stack : undefined,
        );
      }

      if (!discardClient && isEmailAlreadyExistsError(error)) {
        return { ok: false, reason: 'EMAIL_ALREADY_EXISTS' };
      }

      throw error;
    } finally {
      client.release(discardClient);
    }
  }
}

function isEmailAlreadyExistsError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if (
    !('code' in error) ||
    error.code !== POSTGRES_ERROR_CODES.UNIQUE_VIOLATION
  ) {
    return false;
  }

  if (
    !('constraint' in error) ||
    error.constraint !== USER_CONSTRAINTS.EMAIL_UNIQUE
  ) {
    return false;
  }

  return true;
}
