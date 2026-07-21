import { Test, TestingModule } from '@nestjs/testing';
import { SectionsImagesService } from './sections-images.service';

describe('SectionsImagesService', () => {
  let service: SectionsImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SectionsImagesService],
    }).compile();

    service = module.get<SectionsImagesService>(SectionsImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
