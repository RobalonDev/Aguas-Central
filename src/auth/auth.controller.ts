import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('register')
  createUser(@Body() dto: RegisterDto) {
    const payload = dto;
    console.log(payload);

    return payload;
  }
}
