import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';

@Injectable()
export class EventUsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUsers(eventId: number, userId: number) {
    const event = await this.databaseService.event.findUnique({
      where: { id: eventId },
      include: { users: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isOwner = event.creatorId === userId;
    const isMember = event.users.some((cu) => cu.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You are not a member of this event');
    }

    return this.databaseService.eventUser.findMany({
      where: { eventId },
      include: { user: true },
    });
  }

  async delete(eventId: number, userId: number, currentUserId: number) {
    const event = await this.databaseService.event.findUnique({
      where: { id: eventId },
      include: { users: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== currentUserId) {
      throw new ForbiddenException('Only the owner can remove users');
    }

    if (userId === currentUserId) {
      throw new ForbiddenException('Owner cannot remove themselves');
    }

    const eventUser = await this.databaseService.eventUser.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (!eventUser) {
      throw new NotFoundException('User is not a member of this event');
    }

    return this.databaseService.eventUser.delete({
      where: { id: eventUser.id },
    });
  }
}
