// src/file/file.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './file.controller';
import { FileService } from './file.service'; 
import { OpenAIService } from '../services/openai.service';

@Module({
  imports: [ConfigModule], 
  controllers: [FileController],
  providers: [FileService, OpenAIService],
})
export class FileModule {}