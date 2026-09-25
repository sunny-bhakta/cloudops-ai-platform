import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';

import { AiService } from './ai.service.js';
import { AiMetrics } from './observability/ai.metrics.js';

class ChatRequestDto {
  message!: string;
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiMetrics: AiMetrics,
  ) { }

  @Post('chat')
  async chat(
    @Body() body: ChatRequestDto,
     @Headers('x-request-id') requestId?: string,
  ) {
    return this.aiService.chat(
      body.message,
      requestId,
    );
  }

  @Get('metrics')
  getMetrics() {
    // TODO: protect with internal/admin authorization
    return this.aiMetrics.snapshot();
  }
}