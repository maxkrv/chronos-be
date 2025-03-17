import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';

import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  controllers: [CalendarController],
  providers: [DatabaseService, CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
