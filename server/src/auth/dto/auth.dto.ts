import { IsEmail, IsString } from "class-validator";

export class SignInDto {
  @IsString()
  name: string;

  @IsString()
  password: string;
}

export class SignUpDto extends SignInDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  refreshToken?: string;
}
