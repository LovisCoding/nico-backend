import { HttpException, Injectable } from '@nestjs/common';
import { CreateSectionsImageDto } from './dto/create-sections-image.dto';
import { UpdateSectionsImageDto } from './dto/update-sections-image.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteImagesSections } from './dto/delete-images-sections.dto';

@Injectable()
export class SectionsImagesService {
  constructor(private prisma: PrismaService) { }
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
      orderBy: { order: 'asc' },
      include: { image: true }
    }
    );
  }

  findOne(id: number) {
    return this.prisma.sectionImages.findMany({
      where: { sectionId: id },
      orderBy: { order: 'asc' },
      include: { image: true }
    })
  }

  async update(updateSectionsImageDto: UpdateSectionsImageDto) {
    // Cas 1: Reordering complet (Drag & Drop)
    if (updateSectionsImageDto.orderedImageIds && updateSectionsImageDto.orderedImageIds.length > 0) {
      // Étape 1 : Passer par des valeurs négatives temporaires pour éviter les collisions de contrainte UNIQUE
      const tempOps = updateSectionsImageDto.orderedImageIds.map((imageId, index) => {
        return this.prisma.sectionImages.update({
          where: {
            sectionId_imageId: {
              sectionId: updateSectionsImageDto.idSection,
              imageId: imageId,
            },
          },
          data: {
            // On utilise des valeurs négatives uniques pour être sûr de ne pas conflire avec les existants
            order: -1 * (index + 1),
          },
        });
      });

      // On exécute la première passe
      await this.prisma.$transaction(tempOps);

      // Étape 2 : Mettre les vraies valeurs finales
      const finalOps = updateSectionsImageDto.orderedImageIds.map((imageId, index) => {
        return this.prisma.sectionImages.update({
          where: {
            sectionId_imageId: {
              sectionId: updateSectionsImageDto.idSection,
              imageId: imageId,
            },
          },
          data: {
            order: (index + 1) * 1000,
          },
        });
      });

      return await this.prisma.$transaction(finalOps);
    }

    // Cas 2: Swap (Legacy / Button click)
    const changeWith = await this.prisma.sectionImages.findFirst({
      where: {
        sectionId: updateSectionsImageDto.idSection,
        imageId: updateSectionsImageDto.changeWith,
      },
    });

    const imageToChange = await this.prisma.sectionImages.findFirst({
      where: {
        sectionId: updateSectionsImageDto.idSection,
        imageId: updateSectionsImageDto.idImageToChangeOrder,
      },
    });

    if (!changeWith || !imageToChange) {
      throw new HttpException('Images not found in section', 400);
    }

    // Sauvegarde des ordres actuels puis échange via une transaction
    const orderA = changeWith.order;
    const orderB = imageToChange.order;

    await this.prisma.sectionImages.update({
      where: {
        sectionId_imageId: {
          sectionId: updateSectionsImageDto.idSection,
          imageId: changeWith.imageId,
        },
      },
      data: { order: 0 },
    });
    const ops = [

      this.prisma.sectionImages.update({
        where: {
          sectionId_imageId: {
            sectionId: updateSectionsImageDto.idSection,
            imageId: imageToChange.imageId,
          },
        },
        data: { order: orderA },
      }),

      this.prisma.sectionImages.update({
        where: {
          sectionId_imageId: {
            sectionId: updateSectionsImageDto.idSection,
            imageId: changeWith.imageId,
          },
        },
        data: { order: orderB },
      }),

    ];

    return await this.prisma.$transaction(ops);
  }


  remove(id: number) {
    return `This action removes a #${id} sectionsImage`;
  }
  async orderById(id: number) {
    const sectionImages = await this.prisma.sectionImages.findFirst({
      where: { sectionId: id },
      orderBy: { order: 'desc' }
    })
    return sectionImages ? sectionImages.order + 1000 : 1000;
  }
  removeImageFromSection(deleteImageSections: DeleteImagesSections) {
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
