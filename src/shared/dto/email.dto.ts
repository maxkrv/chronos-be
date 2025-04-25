import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class EmailDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
}
