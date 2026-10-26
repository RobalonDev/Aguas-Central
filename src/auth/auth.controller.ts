import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);

    return { message: 'Solicitud de registro procesada' };
  }
}
