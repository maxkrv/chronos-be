import { Paginated } from './paginated.dto';
import { PaginationOptionsDto } from './pagination-options.dto';

export class Paginator {
  static paginate<TData extends object>(
    data: TData[],
    count: number,
    opt: PaginationOptionsDto,
  ): Paginated<TData> {
    return {
      items: data,
      meta: {
        itemCount: count,
        totalItems: data.length,
        itemsPerPage: opt.limit,
        currentPage: opt.page,
      },
    };
  }
}
