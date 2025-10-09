import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadFileDocumentSectionsDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as UploadFileDocumentSectionsDto;
      } catch {
        return value;
      }
    }
    return value as UploadFileDocumentSectionsDto[];
  })
  sections?: UploadFileDocumentSectionsDto[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return !!value;
  })
  dryRun?: boolean;
}
