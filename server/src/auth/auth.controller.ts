import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/user/userdto/user.dto';
import { Request, Response } from 'express';
import { SignInDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  async getHello() {
    return 'Hello World!';
  }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(signInDto);
    const data = await this.authService.signIn(
      signInDto.name,
      signInDto.password,
    );
    if (!data.access_token || !data.refresh_token) {
      throw new Error('User not created');
    }

    res
      .cookie('access_token', data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .cookie('refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    return {
      message: 'User created successfully',
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  }
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signUp(
    @Body() signUpDto: UserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(signUpDto);
    const data = await this.authService.register(signUpDto);
    if (!data.access_token || !data.refresh_token) {
      throw new Error('User not created');
    }

    res
      .cookie('access_token', data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .cookie('refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    return {
      message: 'User created successfully',
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  }

  @Get('session')
  async getSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refresh_token = req.cookies['refresh_token'];
    if (!refresh_token) {
      throw new BadRequestException('No active session found');
    }
    const data = await this.authService.getSession(refresh_token);
    if (!data) {
      throw new NotFoundException('Session not found');
    }
    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.cookie('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return data;
  }
}
