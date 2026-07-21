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
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
      },
    }),
  ]
})
export class ImagesModule { }
