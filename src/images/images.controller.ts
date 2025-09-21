import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UploadedFile,
    UseInterceptors,
    ParseArrayPipe, HttpException, Res, StreamableFile, Query,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorators/public.decorator';
import { Response } from 'express';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile() file: Express.Multer.File,
         @Body('title') title?: string,  @Body('sections', new ParseArrayPipe({ items: Number, optional: true })) sections?: number[])  {
    if (!file) {
      throw new HttpException('Image file is required', 400);
    }

    const url =  await this.imagesService.uploadImage(file);
    return this.imagesService.create({ title, url, sections });
  }

  @Public()
  @Get()
  findAll() {
    return this.imagesService.findAll();
  }
    @Public()
    @Get('webp')
    async webp(@Query('link') link: string, @Query('size') size: string) {
        const buffer = await this.imagesService.webp(link,parseInt(size));
        return new StreamableFile(buffer, {
            type: 'image/webp',
        });
    }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(+id, updateImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(+id);
  }
}
