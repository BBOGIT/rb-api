import { Module } from '@nestjs/common';
import { ScreenshotController } from './screenshot.controller';
import { ScreenshotService } from './screenshot.service';
import { PuppeteerService } from '../services/puppeteer.service';
import { OpenAIService } from '../services/openai.service';
import { FileService } from '../services/file.service';

@Module({
  controllers: [ScreenshotController],
  providers: [ScreenshotService, PuppeteerService, OpenAIService, FileService],
})
export class ScreenshotModule {}