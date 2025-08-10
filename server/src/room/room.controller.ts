import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  
} from '@nestjs/common';
import { RoomService } from './room.service';
import { JoinRoomDto, LeaveRoomDto } from './dto/room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAllRooms() {
    try {
      return await this.roomService.getAllRooms();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch rooms');
    }
  }

  @Get(':id')
  async getRoomInfo(@Param('id') id: string) {
    try {
      const room = await this.roomService.getRoomInfo(id);
      if (!room) {
        throw new NotFoundException(`Room with id ${id} not found`);
      }
      return room;
    } catch (error) {
      throw error; // Let Nest handle the specific exception
    }
  }

  @Post()
  async createRoom(@Body() body: { name: string }) {
    if (!body.name) {
      throw new BadRequestException('Room name  is required');
    }
    try {
      const roomId = Math.random().toString(36).substring(2, 9);
      const createdAt = new Date().toISOString();
      const room= await this.roomService.createRoom({
          roomId,
          name: body.name,
          createdAt,
      });
      return room;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create room');
    }
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    try {
      const deleted = await this.roomService.deleteRoom(id);
      if (!deleted) {
        throw new NotFoundException(`Room with id ${id} not found`);
      }
      return { message: 'Room deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/join')
  async joinRoom(@Param('id') id: string, @Body() body: JoinRoomDto) {
    if (!body.userId || !body.socketId) {
      throw new BadRequestException('userId and socketId are required');
    }
    try {
      return await this.roomService.joinRoom(id, body);
    } catch (error) {
      throw new InternalServerErrorException('Failed to join room');
    }
  }

  @Post(':id/leave')
  async leaveRoom(@Param('id') id: string, @Body() body: LeaveRoomDto) {
    if (!body.userId) {
      throw new BadRequestException('userId is required');
    }
    try {
      return await this.roomService.leaveRoom(id, body);
    } catch (error) {
      throw new InternalServerErrorException('Failed to leave room');
    }
  }

  @Get(':id/users')
  async getUsersInRoom(@Param('id') id: string) {
    try {
      const users = await this.roomService.getUsersInRoom(id);
      if (!users) {
        throw new NotFoundException(`Room with id ${id} not found`);
      }
      return users;
    } catch (error) {
      throw error;
    }
  }
}
