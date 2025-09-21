import { PartialType } from '@nestjs/swagger';
import { CreateSectionsImageDto } from './create-sections-image.dto';

export class UpdateSectionsImageDto extends PartialType(CreateSectionsImageDto) {
    idSection: number;
    betweenSectionImages : number[];
    idImageToChangeOrder: number;
}
