import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchCalendarsDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  search?: string;
}
