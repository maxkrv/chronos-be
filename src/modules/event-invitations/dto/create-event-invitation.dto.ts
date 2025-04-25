import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class CreateEventInvitationDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  eventId: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;
}
