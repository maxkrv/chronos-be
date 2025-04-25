import { IntersectionType } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/shared/pagination';

import { SearchPublicCalendarsDto } from './search-public-calendars.dto';
import { SortPublicCalendarsDto } from './sort-public-calendars.dto';

export class GetPublicCalendarsDto extends IntersectionType(
  PaginationOptionsDto,
  SearchPublicCalendarsDto,
  SortPublicCalendarsDto,
) {}
