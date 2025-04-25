import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';

import { EventUsersController } from './event-users.controller';
import { EventUsersService } from './event-users.service';

@Module({
  controllers: [EventUsersController],
  providers: [DatabaseService, EventUsersService],
})
export class EventUsersModule {}
