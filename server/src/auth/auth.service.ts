import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/user/userdto/user.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    name: string,
    password: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: {
      userId: string;
      name: string;
      email: string;
    };
  }> {
    const user = await this.usersService.getUser(name);

    const isPasswordValid = await this.usersService.checkPassword(
      name,
      password,
    );
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.userId, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
        secret: process.env.ACCESS_TOKEN_SECRET,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET,
      }),
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    };
  }

  async generateAccessRefreshToken(payload: {
    id: string;
    username: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    return { access_token, refresh_token };
  }

  async register(user: UserDto) {
    const existingUser = await this.usersService.getUser(user.name);
    if (existingUser) throw new NotAcceptableException('User already exists');
    const [data] = await this.usersService.createUser(user);
    if (!data) throw new BadRequestException('User not created');
    const payload = { id: data.userId, username: user.name };
    const { access_token, refresh_token } =
      await this.generateAccessRefreshToken(payload);
    const updateUser = await this.usersService.addRefreshToken(
      data.userId,
      user.refreshToken,
    );
    if (!updateUser)
      throw new UnauthorizedException('Refresh token not updated');
    return {
      access_token,
      refresh_token,
    };
  }

  async getSession(refresh_token: string) {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      username: string;
    }>(refresh_token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    const user = await this.usersService.getUser(payload.username);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    const new_refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    const updated_refresh_token = await this.usersService.addRefreshToken(
      new_refresh_token,
      user.userId,
    );
    if (!updated_refresh_token) {
      throw new UnauthorizedException('Refresh token not updated');
    }
    return { access_token, refresh_token: updated_refresh_token };
  }
}
