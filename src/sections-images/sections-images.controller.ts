import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SectionsImagesService } from './sections-images.service';
import { CreateSectionsImageDto } from './dto/create-sections-image.dto';
import { UpdateSectionsImageDto } from './dto/update-sections-image.dto';
import { DeleteImagesSections } from './dto/delete-images-sections.dto';

@Controller('sections-images')
export class SectionsImagesController {
  constructor(private readonly sectionsImagesService: SectionsImagesService) {}

  @Post()
  create(@Body() createSectionsImageDto: CreateSectionsImageDto) {
    return this.sectionsImagesService.create(createSectionsImageDto);
  }

  @Get()
  findAll() {
    return this.sectionsImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsImagesService.findOne(+id);
  }

  @Patch()
  update( @Body() updateSectionsImageDto: UpdateSectionsImageDto) {
    return this.sectionsImagesService.update(updateSectionsImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsImagesService.remove(+id);
  }

// Remove Image from Section
  @Delete(':sectionId/:imageId')
  removeImageFromSection(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    const dto: DeleteImagesSections = { sectionId, imageId } as DeleteImagesSections;
    return this.sectionsImagesService.removeImageFromSection(dto);
  }


}
