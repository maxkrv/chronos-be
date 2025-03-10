import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';

export const DEFAULT_ITEMS_LIMIT = 10;
export const DEFAULT_PAGE = 1;

export class PaginationOptionsDto {
  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page: number = DEFAULT_PAGE;

  @ApiProperty({ required: false, default: DEFAULT_ITEMS_LIMIT, maximum: 100 })
  @Max(100)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit: number = DEFAULT_ITEMS_LIMIT;
}
