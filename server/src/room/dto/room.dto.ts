import { IsString, IsDateString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  roomId: string;

  @IsDateString({}, { message: 'createdAt must be a valid date string' })
  createdAt: string;
}

export class JoinRoomDto {
  @IsString()
  userId: string;

  @IsString()
  socketId: string;
}

export class LeaveRoomDto {
  @IsString()
  userId: string;
}
