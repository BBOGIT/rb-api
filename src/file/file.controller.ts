import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { FilePriceDto } from './dto/file-price.dto';
import { FileService } from './file.service';

@ApiTags('files')
@Controller('api/v1')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('file-price')
  @ApiOperation({ summary: 'Upload image and extract price' })
  @ApiResponse({ status: 200, description: 'Price extracted successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `upload-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFileAndGetPrice(
    @UploadedFile() file: Express.Multer.File,
    @Body() filePriceDto: FilePriceDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    filePriceDto.file = file;

    try {
      return await this.fileService.processFileAndGetPrice(filePriceDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}