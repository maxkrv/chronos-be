import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';

import { CalendarController } from './calendar.controller';
import { CalendarRepository } from './calendar.repository';
import { CalendarService } from './calendar.service';

@Module({
  controllers: [CalendarController],
  providers: [DatabaseService, CalendarService, CalendarRepository],
})
export class CalendarModule {}
