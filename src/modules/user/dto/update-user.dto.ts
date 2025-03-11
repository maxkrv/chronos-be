import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  surname: string;

  //   @ApiProperty()
  //   @IsString()
  //   @IsNotEmpty()
  //   @MaxLength(50)
  //   timezone: string;
}
