import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';

import { CalendarController } from './calendar.controller';
import { CalendarService } from './services/calendar.service';
import { NagerDateSDK } from './services/nager-date-sdk.service';

@Module({
  controllers: [CalendarController],
  providers: [DatabaseService, CalendarService, NagerDateSDK],
  exports: [CalendarService],
})
export class CalendarModule {}
