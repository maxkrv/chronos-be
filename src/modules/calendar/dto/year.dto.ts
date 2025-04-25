import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class YearDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  year: number;
}
