import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3000;

  app.use(cookieParser());
  app.enableCors({
    // origin: process.env.FRONTEND_URL!,
    origin:"http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true,
  });

  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
