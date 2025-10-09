import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteChunksBySourceDto {
  @IsString()
  @IsNotEmpty()
  source: string;
}
