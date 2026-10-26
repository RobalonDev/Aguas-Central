import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PasswordHasherService } from './password-hasher.service';
import { AuthRepository } from './auth.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  exports: [],
  controllers: [AuthController],
  providers: [PasswordHasherService, AuthRepository],
})
export class AuthModule {}
