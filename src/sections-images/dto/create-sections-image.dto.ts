// typescript
import { IsInt, IsOptional, IsArray, ArrayNotEmpty, IsPositive } from 'class-validator';

export class CreateSectionsImageDto {
  @IsInt()
  sectionId: number;

  @IsOptional()
  @IsInt()
  imageId?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  imageIds?: number[];

  @IsOptional()
  @IsInt()
  order?: number;
}