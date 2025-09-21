import {HttpException, Injectable} from '@nestjs/common';
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

  async update(updateSectionsImageDto: UpdateSectionsImageDto) {
      //Get sectionsImages between
       const betweenSectionImages = await this.prisma.sectionImages.findMany({
          where: {
                sectionId :  updateSectionsImageDto.idSection ,
                imageId : { in: updateSectionsImageDto.betweenSectionImages }
          }
        });
      let betweenSectionImagesOrdered = 0;
      if (betweenSectionImages.length === 1) {
          if (updateSectionsImageDto.betweenSectionImages[0] === -1) {
              betweenSectionImagesOrdered = betweenSectionImages[0].order /2;
          } else {
                betweenSectionImagesOrdered = betweenSectionImages[0].order + 1000;
          }
      }
      else if (betweenSectionImages.length === 2) {
            betweenSectionImagesOrdered = (betweenSectionImages[0].order + betweenSectionImages[1].order) / 2;
      }
      else {
          throw new HttpException("Pas assez d'image pour trier ", 400);
      }

      return this.prisma.sectionImages.update({
          where: {
              sectionId_imageId: {
                  sectionId: updateSectionsImageDto.idSection, imageId: updateSectionsImageDto.idImageToChangeOrder
              }
          },
          data: {
              order: betweenSectionImagesOrdered
          }
      });


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
