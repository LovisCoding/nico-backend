import { Test, TestingModule } from '@nestjs/testing';
import { SectionsImagesController } from './sections-images.controller';
import { SectionsImagesService } from './sections-images.service';

describe('SectionsImagesController', () => {
  let controller: SectionsImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionsImagesController],
      providers: [SectionsImagesService],
    }).compile();

    controller = module.get<SectionsImagesController>(SectionsImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
