import { ApiProperty } from '@nestjs/swagger';
import { EventCategory, Frequency } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startAt: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endAt?: Date;

  @ApiProperty()
  @IsEnum(EventCategory)
  @IsNotEmpty()
  category: EventCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  link?: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  calendarId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(Frequency)
  frequency?: Frequency;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  interval?: number;
}
