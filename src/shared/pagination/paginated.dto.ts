import { ApiProperty } from '@nestjs/swagger';

const DEFAULT_ITEMS_LIMIT = 20;

class PaginationMeta {
  @ApiProperty({ example: 1 })
  itemCount: number;

  @ApiProperty({ example: 1 })
  totalItems: number;

  @ApiProperty({ example: DEFAULT_ITEMS_LIMIT })
  itemsPerPage: number;

  @ApiProperty({ example: 1 })
  currentPage: number;
}

export class Paginated<TData extends object> {
  @ApiProperty()
  items: TData[];
  @ApiProperty()
  meta: PaginationMeta;
}
