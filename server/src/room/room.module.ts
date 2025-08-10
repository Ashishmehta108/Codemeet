import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { DatabaseModule } from 'src/db/db';

@Module({
  imports: [DatabaseModule],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}  
