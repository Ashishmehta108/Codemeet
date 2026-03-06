import { Controller, Post, Body } from '@nestjs/common';
import { CodeService } from './code.service';
import { ExecutionRequest, ExecutionResponse } from '../../../shared/src/types/code';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post('execute')
  async execute(@Body() request: ExecutionRequest): Promise<ExecutionResponse> {
    return this.codeService.execute(request.language, request.code);
  }
}
