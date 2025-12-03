import { HttpException, Injectable } from '@nestjs/common';
import { CreateSectionsImageDto } from './dto/create-sections-image.dto';
import { UpdateSectionsImageDto } from './dto/update-sections-image.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteImagesSections } from './dto/delete-images-sections.dto';

@Injectable()
export class SectionsImagesService {
  constructor(private prisma: PrismaService) {}
  async create(createSectionsImageDto: CreateSectionsImageDto) {
    const newBaseOrder = await this.orderById(createSectionsImageDto.sectionId);
    const dtoAny = createSectionsImageDto as any;

    if (Array.isArray(dtoAny.imageIds) && dtoAny.imageIds.length > 0) {
      const createOps = dtoAny.imageIds.map((imageId: number, idx: number) => {
        const order = createSectionsImageDto.order ?? newBaseOrder + idx * 1000;
        return this.prisma.sectionImages.create({
          data: {
            section: { connect: { id: createSectionsImageDto.sectionId } },
            image: { connect: { id: imageId } },
            order,
          },
        });
      });

      return this.prisma.$transaction(createOps);
    }


    return this.prisma.sectionImages.create({
      data: {
        section: { connect: { id: createSectionsImageDto.sectionId } },
        image: { connect: { id: createSectionsImageDto.imageId } },
        order: createSectionsImageDto.order ?? newBaseOrder,
      }
    });
  }
  findAll() {
    return this.prisma.sectionImages.findMany({
      orderBy : { order: 'asc'},
      include: { image: true  }
      }
    );
  }

  findOne(id: number) {
    return this.prisma.sectionImages.findMany({
      where : { sectionId: id},
      orderBy : { order: 'asc'},
      include: { image: true  }
    })
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
         where: { sectionId: id },
         orderBy: { order: 'desc' }
       })
       return sectionImages ? sectionImages.order + 1000 : 1000 ;
  }
  removeImageFromSection(deleteImageSections : DeleteImagesSections) {
       return this.prisma.sectionImages.delete({
          where: {
              sectionId_imageId: {
                  sectionId: deleteImageSections.sectionId,
                  imageId: deleteImageSections.imageId,
              }
          }
      }).catch(err => {
          throw new HttpException("Image / Section Not found", 400);
       });
  }
}
