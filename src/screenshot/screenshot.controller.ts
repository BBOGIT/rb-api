import { Controller, Post, Body } from '@nestjs/common';
import { ScreenshotService } from './screenshot.service';
import { ScreenshotDto } from './dto/screenshot.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('screenshots')
@Controller('api/v1')
export class ScreenshotController {
  constructor(private readonly screenshotService: ScreenshotService) {}

  @Post('screenshot-price')
  @ApiOperation({ summary: 'Get screenshot and extract price' })
  @ApiResponse({ status: 200, description: 'Screenshot captured and price extracted successfully' })
  async getScreenshotPrice(@Body() screenshotDto: ScreenshotDto) {
    return this.screenshotService.processScreenshotPrice(screenshotDto);
  }
}