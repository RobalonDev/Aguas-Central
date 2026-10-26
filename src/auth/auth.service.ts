import { Injectable } from '@nestjs/common';
import { PasswordHasherService } from './password-hasher.service';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordHasherService: PasswordHasherService,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(registerData: RegisterDto): Promise<void> {
    const hashedPassword = await this.passwordHasherService.hash(
      registerData.password,
    );

    const createUserData = {
      email: registerData.email,
      displayName: registerData.displayName,
      passwordHash: hashedPassword,
    };

    const newUser =
      await this.authRepository.createUserWithPassword(createUserData);

    if (!newUser.ok) {
      return;
    }
  }
}
