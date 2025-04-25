import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { MailService } from 'src/shared/services/mail.service';

import { ApiConfigModule } from '../../config/api-config.module';
import { CalendarInvitationsController } from './calendar-invitations.controller';
import { CalendarInvitationsService } from './calendar-invitations.service';

@Module({
  imports: [ApiConfigModule],
  controllers: [CalendarInvitationsController],
  providers: [DatabaseService, CalendarInvitationsService, MailService],
})
export class CalendarInvitationsModule {}
