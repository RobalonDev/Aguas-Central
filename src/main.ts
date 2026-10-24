import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Environment } from './config/env.validaction';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  app.enableShutdownHooks();

  if (environment !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('App de casa')
      .setDescription('API para gestionar hogares y sus miembros')
      .setVersion('0.1.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);

  if (environment !== 'production') {
    console.log(`⚙️  Server is running in ${environment} mode ⚙️`);
    console.log(
      `🚀 Server is running on port http://localhost:${port ?? 3000} 🚀`,
    );
  }
}
bootstrap().catch((error: unknown) => {
  console.error('Error al iniciar la aplicación:', error);
  process.exitCode = 1;
});
