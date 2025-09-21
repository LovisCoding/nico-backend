import {Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import {Public} from "../decorators/public.decorator";

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }
  @Public()
  @Get('shootings')
    findAllShootings() {
        return this.sectionsService.findAllShootings();
    }

  @Public()
  @Get('name')
    findBySectionName(@Query('name') name: string) {
        if (!name) {
            return new HttpException('No Name', 400);
        }
        return this.sectionsService.findBySectionName(name);
    }

  @Public()
  @Get(':sectionId')

  findBySectionId(@Param('sectionId') sectionId: string) {
      return this.sectionsService.findBySectionId(parseInt(sectionId));
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(+id, updateSectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(+id);
  }
}
