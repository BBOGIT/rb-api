import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sharp from 'sharp';
import { OpenAIService } from '../services/openai.service';
import { FilePriceDto } from './dto/file-price.dto';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly configService: ConfigService,
  ) {}

  async processFileAndGetPrice(filePriceDto: FilePriceDto) {
    this.logger.debug(`Processing file: ${filePriceDto.file.filename}`);

    try {
      // Process image with Sharp and convert to base64
      const processedImageBuffer = await Sharp(filePriceDto.file.path)
        .resize(800, 512, { fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer();

      const base64Image = processedImageBuffer.toString('base64');

      // Get configurations
      const defaultPrompt = this.configService.get<string>('DEFAULT_PROMPT') ||
        "Extract two numbers: regular price and discounted price (if exists). Return in format: 'regular:X;discounted:Y'. If no discount, return only regular price.";
      const defaultAiProvider = this.configService.get<string>('AI_PROVIDER') || 'openai';
      
      // Get result from OpenAI service
      const result = await this.openaiService.getPriceFromImage(
        base64Image,
        filePriceDto.prompt || defaultPrompt,
        filePriceDto.ai || defaultAiProvider,
      );

      return {
        success: true,
        result,
        image: {
          data: `data:image/webp;base64,${base64Image}`,
          contentType: 'image/webp'
        }
      };
    } catch (error) {
      this.logger.error('Error processing file and getting price', {
        error: error.message,
        stack: error.stack,
        filename: filePriceDto.file.filename,
      });
      throw error;
    }
  }
}