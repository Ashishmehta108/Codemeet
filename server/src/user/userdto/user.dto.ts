import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class UserDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
