import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API health' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}