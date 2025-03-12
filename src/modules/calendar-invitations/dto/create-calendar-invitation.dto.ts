import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class CreateCalendarInvitationDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  calendarId: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;
}
