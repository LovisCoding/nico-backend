import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { SectionsImagesModule } from '../sections-images/sections-images.module';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [PrismaModule,
    SectionsImagesModule,
    MulterModule.register({
      storage: multer.memoryStorage(),
      }),
  ]
})
export class ImagesModule {}
