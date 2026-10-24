import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  exports: [],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
