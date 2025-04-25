import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class GetEventsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional()
  calendarId?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  toDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  search?: string;
}
