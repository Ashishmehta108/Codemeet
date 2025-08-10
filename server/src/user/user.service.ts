import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { usersTable } from 'src/db/schema';
import { UserDto } from './userdto/user.dto';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  @Inject('db') private database: NodePgDatabase;
  constructor(private jwtService: JwtService) {}

  async getUserInfo(userId: string) {
    const [user] = await this.database
      .select({
        userId: usersTable.userId,
        name: usersTable.name,
        email: usersTable.email,
        refreshToken: usersTable.refreshToken,
      })
      .from(usersTable)
      .where(eq(usersTable.userId, userId));
    return user;
  }

  async getUserByToken(access_token: string) {
    const payload = await this.jwtService.verifyAsync(access_token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    if (!payload) {
      throw new UnauthorizedException('Invalid access token');
    }
    const user = await this.getUserInfo(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async checkPassword(name: string, password: string) {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.name, name));
    console.log(name, password, user.password);
    const isPasswordValid = await argon2.verify(user.password, password);
    console.log('isPasswordValid', isPasswordValid);
    return isPasswordValid;
  }
  async getUser(name: string) {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.name, name));
    return user;
  }
  async createUser(user: UserDto) {
    const userId = await randomUUID();
    const hashedPassword = await argon2.hash(user.password);
    console.log('Creating user:', user.name, hashedPassword);
    const data = await this.database
      .insert(usersTable)
      .values({
        userId: userId,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        refreshToken: user.refreshToken,
      })
      .returning({
        userId: usersTable.userId,
        name: usersTable.name,
        email: usersTable.email,
      });
    return data;
  }
  async addRefreshToken(refresh_token: string, userId: string) {
    const data = await this.database
      .update(usersTable)
      .set({ refreshToken: refresh_token })
      .where(eq(usersTable.userId, userId))
      .returning({
        refreshToken: usersTable.refreshToken,
      });
    return data;
  }
}
