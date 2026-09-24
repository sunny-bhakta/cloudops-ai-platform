import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import { AiService } from './ai.service';
import { AiMetrics } from './observability/ai.metrics';

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
  ) {
    return this.aiService.chat(
      body.message,
    );
  }

  @Get('metrics')
  getMetrics() {
    return this.aiMetrics.snapshot();
  }
}