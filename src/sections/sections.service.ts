import { Injectable } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class SectionsService {
    constructor(private prisma: PrismaService) {}
  create(createSectionDto: CreateSectionDto) {
    return this.prisma.sections.create({
        data: {
            title: createSectionDto.title,
        }
    });
  }

  findAll() {
    return this.prisma.sections.findMany();
  }
    findAllShootings() {
        return this.prisma.sections.findMany({
            where: {
                title: {not: 'Accueil'}
            },
            orderBy: {
                id: 'desc'
            },
            include: {
                images: {
                    orderBy: {order: 'asc'},
                }
            }
        });
    }
  findBySectionId(sectionId: number) {
        return this.prisma.image.findMany({
            where: {
                sections: {
                    some: {
                        sectionId: sectionId
                    }
                }
            }
        });
    }

    findBySectionName(name: string) {
        return this.prisma.sections.findFirst({
            where: { title: name },
            include: {
                images: {
                    orderBy: { order: 'asc' },
                    include: { image: true}
                }
            }
        });
    }

  findOne(id: number) {
    return `This action returns a #${id} section`;
  }

  update(id: number, updateSectionDto: UpdateSectionDto) {
    return this.prisma.sections.update({
        where: {id},
        data: {
            title: updateSectionDto.title,
        }
    }
  );
  }

  remove(id: number) {
    return this.prisma.sections.delete({
        where: { id }
    })
  }
}
