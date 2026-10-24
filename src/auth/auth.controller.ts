import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return {
      email: dto.email,
      displayName: dto.displayName,
    };
  }
}
