import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

export class CountryCodeDto {
  @ApiProperty()
  @MaxLength(3)
  @MinLength(2)
  countryCode: string;
}
