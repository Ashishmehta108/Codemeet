import { Test, TestingModule } from '@nestjs/testing';
import { CodeController } from './code.controller';
import { CodeService } from './code.service';

describe('CodeController', () => {
  let controller: CodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeController],
      providers: [
        {
          provide: CodeService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CodeController>(CodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
