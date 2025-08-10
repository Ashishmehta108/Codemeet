import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as http from 'http';
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

  const server = http.createServer(app.getHttpAdapter().getInstance());

  const chatGateway = app.get(ChatGateway);
  chatGateway.initialize(server);

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}
bootstrap();
