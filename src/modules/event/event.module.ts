import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';

import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  controllers: [EventController],
  providers: [DatabaseService, EventService],
})
export class EventModule {}
