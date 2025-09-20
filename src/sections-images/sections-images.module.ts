import { Module } from '@nestjs/common';
import { SectionsImagesService } from './sections-images.service';
import { SectionsImagesController } from './sections-images.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [SectionsImagesController],
  providers: [SectionsImagesService],
  imports: [PrismaModule],
  exports: [SectionsImagesService],
})
export class SectionsImagesModule {}
