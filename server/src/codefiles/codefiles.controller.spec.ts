import { Test, TestingModule } from '@nestjs/testing';
import { CodefilesController } from './codefiles.controller';

describe('CodefilesController', () => {
  let controller: CodefilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodefilesController],
    }).compile();

    controller = module.get<CodefilesController>(CodefilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
