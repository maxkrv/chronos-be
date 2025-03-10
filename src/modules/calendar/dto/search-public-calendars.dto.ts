import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchPublicCalendarsDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;
}
