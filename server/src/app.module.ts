import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { RoomController } from './room/room.controller';
import { RoomService } from './room/room.service';
import { RoomModule } from './room/room.module';
import { DatabaseModule } from './db/db';
import { ChatGateway } from './ws/ws.gateway';
import { CodeModule } from './code/code.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    UserModule,
    RoomModule,
    DatabaseModule,
    CodeModule,
    AuthModule,
    JwtModule,
    EventsModule,
  ],
  controllers: [AppController, UserController, RoomController, AuthController],
  providers: [
    AppService,
    UserService,
    RoomService,
    ChatGateway,
    JwtService,
    AuthService,
  ],
})
export class AppModule {}
