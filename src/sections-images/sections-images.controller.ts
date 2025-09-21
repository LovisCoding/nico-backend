import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SectionsImagesService } from './sections-images.service';
import { CreateSectionsImageDto } from './dto/create-sections-image.dto';
import { UpdateSectionsImageDto } from './dto/update-sections-image.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectionsImageDto: UpdateSectionsImageDto) {
    //return this.sectionsImagesService.update(+id, updateSectionsImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsImagesService.remove(+id);
  }

}
