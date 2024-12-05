import { Injectable, BadRequestException } from '@nestjs/common';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import * as Sharp from 'sharp';

@Injectable()
export class FileService {
  private readonly APP_URL = process.env.APP_URL || 'http://localhost:1888';

  async saveScreenshot(buffer: Buffer): Promise<string> {
    try {
      const fileName = `screenshot-${Date.now()}.webp`;
      const dirPath = join(process.cwd(), 'public', 'screenshots');

      await mkdir(dirPath, { recursive: true });

      const processedBuffer = await Sharp(buffer)
        .resize(800, 512, { fit: 'inside' })
        .webp({ quality: 60 })
        .toBuffer();

      const filePath = join(dirPath, fileName);
      await writeFile(filePath, processedBuffer);

      return `${this.APP_URL}/screenshots/${fileName}`;
    } catch (error) {
      throw new Error(`Failed to save screenshot: ${error.message}`);
    }
  }

  async processUploadedFile(
    filePath: string,
    width: number,
    height: number,
  ): Promise<string> {
    try {
      const fileName = `processed-${Date.now()}.webp`;
      const dirPath = join(process.cwd(), 'public', 'screenshots');
      const outputPath = join(dirPath, fileName);

      await mkdir(dirPath, { recursive: true });

      await Sharp(filePath)
        .resize(width, height, { fit: 'inside' })
        .webp({ quality: 60 })
        .toFile(outputPath);

      // Clean up original file
      await unlink(filePath);

      return `${this.APP_URL}/screenshots/${fileName}`;
    } catch (error) {
      throw new BadRequestException(`Failed to process file: ${error.message}`);
    }
  }

  async ensureDirectories(): Promise<void> {
    const dirs = [
      join(process.cwd(), 'public', 'uploads'),
      join(process.cwd(), 'public', 'screenshots'),
    ];

    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
    }
  }
}