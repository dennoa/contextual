import { IsNumberString, IsOptional } from 'class-validator';

export class ListChunksDto {
  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsNumberString()
  @IsOptional()
  offset?: number;
}
