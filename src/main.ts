import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { setupApplication } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApplication(app);

  const port = process.env.PORT ?? 5000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`Swagger docs available at http://localhost:${port}/api`);
  }
}

bootstrap().catch((error) => {
  Logger.error('Error starting server', error);
  process.exit(1);
});
