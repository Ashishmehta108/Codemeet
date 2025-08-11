import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

import { ChatGateway } from './ws/ws.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL!,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Start NestJS HTTP server
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);

  const server = app.getHttpAdapter().getInstance();

  const chatGateway = app.get(ChatGateway);
  chatGateway.initialize(server);
}
bootstrap();
