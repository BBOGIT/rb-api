import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilePriceDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Image file to analyze' })
  file: Express.Multer.File;

  @ApiProperty({ description: 'Prompt for price extraction', required: false })
  @IsString()
  @IsOptional()
  prompt?: string;

  @ApiProperty({ description: 'AI provider to use', required: false, enum: ['openai', 'together'] })
  @IsString()
  @IsOptional()
  ai?: string;
}