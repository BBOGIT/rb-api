import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScreenshotDto {
  @ApiProperty({ description: 'URL to capture screenshot from' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Prompt for price extraction', required: false })
  @IsString()
  @IsOptional()
  prompt?: string;

  @ApiProperty({ description: 'Additional options for screenshot', required: false })
  @IsObject()
  @IsOptional()
  options?: Record<string, any>;
}