import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PasswordHasherService } from './password-hasher.service';

@Module({
  imports: [],
  exports: [],
  controllers: [AuthController],
  providers: [PasswordHasherService],
})
export class AuthModule {}
