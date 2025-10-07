import { IsNotEmpty, Matches } from 'class-validator';

export class CreateCollectionDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'name must be alphanumeric with no whitespace',
  })
  name: string;
}
