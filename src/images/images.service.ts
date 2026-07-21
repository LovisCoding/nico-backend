import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import * as fs from 'node:fs';
import sharp from 'sharp';
import { connect } from 'rxjs';
import { SectionsImagesService } from '../sections-images/sections-images.service';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService, private sectionsImagesService: SectionsImagesService) {
  }
  async uploadImage(file: Express.Multer.File) {
    const outputDir = join(__dirname, '..', '..', 'uploads');

    const filename = file.originalname.split('.').slice(0, -1).join('.');
    const outputFilename = `${Date.now()}-${filename}.webp`;
    const outputPath = join(outputDir, outputFilename);

    await sharp(file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    return '/uploads/' + outputFilename;

  }
  async create(createImageDto: CreateImageDto) {
    const dbRequest =
    {
      data: {
        title: createImageDto.title,
        url: createImageDto.url,
        sections: {
          create: [] as { section: { connect: { id: number } }, order: number }[]
        },
      }
    };
    for (const sectionId of createImageDto.sections || []) {
      dbRequest.data.sections.create.push({
        section: {
          connect: { id: sectionId },
        },
        order: await this.sectionsImagesService.orderById(sectionId),
      });
    }

    return this.prisma.image.create(dbRequest);
  }

  findAll() {
    return this.prisma.image.findMany();
  }
  async webp(link: string, size?: number) {

    const filePath = join(__dirname, '..', '..', link.split('?')[0]);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found' + ' ' + filePath);
    }
    if (!size) {
      return sharp(filePath).toBuffer();
    }

    return sharp(filePath).resize({ width: size, height: undefined, fit: 'inside' }).toBuffer();
  }


  findOne(id: number) {
    return this.prisma.image.findUnique({ where: { id } });
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  async remove(id: number) {
    // Supprimer d'abord les liaisons images-sections
    await this.prisma.sectionImages.deleteMany({
      where: { imageId: id }
    });

    return this.prisma.image.delete({ where: { id } }).then((image) => {
      fs.unlink(join(__dirname, '..', '..', image.url), (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully');
        }
      }
      );

    })
  }
}
