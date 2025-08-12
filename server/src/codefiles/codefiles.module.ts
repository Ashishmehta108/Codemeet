import { Module } from '@nestjs/common';
import { CodefilesService } from './codefiles.service';
import { CodefilesController } from './codefiles.controller';

@Module({
  providers: [CodefilesService],
  controllers: [CodefilesController]
})
export class CodefilesModule {}
