import { IsOptional, IsString } from 'class-validator';

export class UploadFileDocumentSectionsDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  ref?: string;
}

export class UploadFileDto {
  @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => UploadFileDocumentSectionsDto)
  sections?: string;

  @IsOptional()
  // @IsBoolean()
  dryRun?: string;
}
