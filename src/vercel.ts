import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { setupApplication } from './setup-app';

// Cached Express instance for Vercel serverless (avoids cold init on every request after first)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let expressApp: any;

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!expressApp) {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
    });
    setupApplication(app);
    await app.init();
    expressApp = app.getHttpAdapter().getInstance();
    Logger.log('Nest app initialized for Vercel');
  }
  expressApp(req, res);
}
