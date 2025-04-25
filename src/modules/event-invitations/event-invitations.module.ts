import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { MailService } from 'src/shared/services/mail.service';

import { ApiConfigModule } from '../../config/api-config.module';
import { EventInvitationsController } from './event-invitations.controller';
import { EventInvitationsService } from './event-invitations.service';

@Module({
  imports: [ApiConfigModule],
  controllers: [EventInvitationsController],
  providers: [DatabaseService, EventInvitationsService, MailService],
})
export class EventInvitationsModule {}
