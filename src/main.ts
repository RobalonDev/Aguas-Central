import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Environment } from './config/env.validaction';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(ConfigService<Environment, true>);
  const port = config.get('PORT', { infer: true });
  const environment = config.get('NODE_ENV', { infer: true });
  await app.listen(port ?? 3000);

  app.enableShutdownHooks();

  if (environment != 'production') {
    console.log(`⚙️  Server is running in ${environment} mode ⚙️`);
  }

  console.log(`🚀 Server is running on port ${port ?? 3000} 🚀`);
}
bootstrap().catch((error: unknown) => {
  console.error('Error al iniciar la aplicación:', error);
  process.exitCode = 1;
});
