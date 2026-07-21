import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import {PrismaModule} from "../prisma/prisma.module";

@Module({
  controllers: [SectionsController],
  providers: [SectionsService],
    imports: [PrismaModule]
})
export class SectionsModule {}
