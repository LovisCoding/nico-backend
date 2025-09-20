import { Injectable } from '@nestjs/common';
import { CreateSectionsImageDto } from './dto/create-sections-image.dto';
import { UpdateSectionsImageDto } from './dto/update-sections-image.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionsImagesService {
  constructor(private prisma: PrismaService) {}
  create(createSectionsImageDto: CreateSectionsImageDto) {
    return 'This action adds a new sectionsImage';
  }

  findAll() {
    return `This action returns all sectionsImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sectionsImage`;
  }

  update(id: number, updateSectionsImageDto: UpdateSectionsImageDto) {
    return `This action updates a #${id} sectionsImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} sectionsImage`;
  }
   async orderById(id: number) {
       const sectionImages = await this.prisma.sectionImages.findFirst({
         where: { imageId: id },
         orderBy: { order: 'desc' }
       })
       return sectionImages ? sectionImages.order + 1000 : 1000 ;
  }
}
