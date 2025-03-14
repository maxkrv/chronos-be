import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';

import { CalendarUsersController } from './calendar-users.controller';
import { CalendarUsersService } from './calendar-users.service';

@Module({
  controllers: [CalendarUsersController],
  providers: [DatabaseService, CalendarUsersService],
})
export class CalendarUsersModule {}
