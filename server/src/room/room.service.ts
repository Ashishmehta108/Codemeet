import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { roomTable, roomUsersTable } from 'src/db/schema';
import { CreateRoomDto, JoinRoomDto, LeaveRoomDto } from './dto/room.dto';

@Injectable()
export class RoomService {
  constructor(@Inject('db') private database: NodePgDatabase) {}

  async getAllRooms() {
    const rooms = await this.database.select().from(roomTable);
    return rooms;
  }
  async getRoomInfo(roomId: string) {
    const [room] = await this.database
      .select()
      .from(roomTable)
      .where(eq(roomTable.roomId, roomId));
    return room;
  }
  async createRoom(room: CreateRoomDto) {
    const r = await this.database.insert(roomTable).values({
      roomId: room.roomId,
      name: room.name,
      createdAt: room.createdAt,
    });
    return r;
  }
  async deleteRoom(roomId: string) {
    const deleted = await this.database
      .delete(roomTable)
      .where(eq(roomTable.roomId, roomId));
    return deleted;
  }

  async joinRoom(roomId: string, joinroom: JoinRoomDto) {
    await this.database.insert(roomUsersTable).values({
      roomId: roomId,
      userId: joinroom.userId,
      socketId: joinroom.socketId,
    });
  }

  async leaveRoom(roomId: string, leaveroom: LeaveRoomDto) {
    await this.database
      .delete(roomUsersTable)
      .where(
        and(
          eq(roomUsersTable.roomId, roomId),
          eq(roomUsersTable.userId, leaveroom.userId),
        ),
      );
  }

  async getUsersInRoom(roomId: string) {
    return this.database
      .select()
      .from(roomUsersTable)
      .where(eq(roomUsersTable.roomId, roomId));
  }
}
