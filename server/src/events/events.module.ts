import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[UserModule],
  providers: [EventsGateway],
})
export class EventsModule {}
