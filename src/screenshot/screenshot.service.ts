import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../services/puppeteer.service';
import { OpenAIService } from '../services/openai.service';
import { FileService } from '../services/file.service';
import { ScreenshotDto } from './dto/screenshot.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScreenshotService {
  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly openaiService: OpenAIService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  async processScreenshotPrice(screenshotDto: ScreenshotDto) {
    const browser = await this.puppeteerService.initializeBrowser(screenshotDto.options);
    try {
      const page = await browser.newPage();
      await this.puppeteerService.setupPage(page);
      await page.goto(screenshotDto.url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      await this.puppeteerService.handleCloudflare(page);
      const screenshotBuffer = await page.screenshot({
        fullPage: false,
        type: 'webp',
        quality: 80,
      });

      const base64Image = screenshotBuffer.toString('base64');
      await this.fileService.saveScreenshot(screenshotBuffer);

      const aiProvider = this.configService.get<string>('AI_PROVIDER');
      const result = await this.openaiService.getPriceFromImage(
        base64Image,
        screenshotDto.prompt,
        aiProvider
      );

      return {
        success: true,
        result,
        image: {
          data: `data:image/webp;base64,${base64Image}`,
          contentType: 'image/webp'
        }
      };
    } finally {
      await browser.close();
    }
  }
}