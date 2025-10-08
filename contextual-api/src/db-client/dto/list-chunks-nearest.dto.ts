import { IsNotEmpty, IsString } from 'class-validator';
import { ListChunksDto } from './list-chunks.dto';

export class ListChunksNearestDto extends ListChunksDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
