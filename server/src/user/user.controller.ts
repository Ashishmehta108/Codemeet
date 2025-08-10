import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  async GetuserInfo(@Req() req: Request) {
    const token = req.cookies.access_token;
    if (!token) throw new BadRequestException('token not found');
    const user = await this.userService.getUserByToken(token);
    if (!user) throw new BadRequestException('user not found');
    return user;
  }
}
