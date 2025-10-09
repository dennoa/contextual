import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class ListChunksDto extends PaginationDto {
  @IsString()
  @IsOptional()
  source?: string;
}
