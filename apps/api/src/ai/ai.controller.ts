import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';

import { AiService } from './ai.service.js';
import { AiMetrics } from './observability/ai.metrics.js';
import { AiRole } from './guardrails/policy.types.js';

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
    @Headers('x-ai-role') roleHeader?: string,
  ) {
    const role: AiRole = this.parseRole(roleHeader);

    return this.aiService.chat(
      body.message,
      requestId,
      role,
    );
  }

  private parseRole(roleHeader?: string): AiRole {
    const role = roleHeader?.toLowerCase();

    if (
      role === 'viewer' ||
      role === 'operator' ||
      role === 'admin'
    ) {
      return role;
    }

    return 'admin';
  }

  @Get('metrics')
  getMetrics() {
    // TODO: protect with internal/admin authorization
    return this.aiMetrics.snapshot();
  }
}