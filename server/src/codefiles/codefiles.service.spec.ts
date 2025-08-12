import { Test, TestingModule } from '@nestjs/testing';
import { CodefilesService } from './codefiles.service';

describe('CodefilesService', () => {
  let service: CodefilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodefilesService],
    }).compile();

    service = module.get<CodefilesService>(CodefilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
