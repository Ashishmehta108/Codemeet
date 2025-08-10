import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';

import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserService } from 'src/user/user.service';
import { DatabaseModule } from 'src/db/db';

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, UserService],
  imports: [
    UserModule,
DatabaseModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '2d' },
    }),
  ],
})
export class AuthModule {}
