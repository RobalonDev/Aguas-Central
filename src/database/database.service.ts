import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { Environment } from 'src/config/env.validation';

@Injectable()
export class DataBaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DataBaseService.name);
  readonly pool: Pool;
  constructor(config: ConfigService<Environment, true>) {
    this.pool = new Pool({
      connectionString: config.get('DATABASE_URL', { infer: true }),
      max: 5,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      application_name: 'house-api',
    });

    this.pool.on('error', (error: Error) => {
      this.logger.error(
        'Error en una conexión inactiva de PostgreSQL',
        error.stack,
      );
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Conexión con PostgreSQL comprobada');
    } catch (error: unknown) {
      await this.pool.end();
      throw error;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
    this.logger.log('Pool de PostgreSQL cerrado');
  }
}
