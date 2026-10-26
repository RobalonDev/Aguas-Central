import { Injectable, Logger } from '@nestjs/common';
import { DataBaseService } from '../database/database.service';

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

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly databaseService: DataBaseService) {}

  async createUserWithPassword(
    data: CreateUserWithPasswordInput,
  ): Promise<CreatedUserRow> {
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

      return user;
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

      throw error;
    } finally {
      client.release(discardClient);
    }
  }
}
