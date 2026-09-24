import { Module } from '@nestjs/common';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';

import { GroqProvider } from './provider/groq.provider';

import { ToolRegistry } from './tools/tool-registry';

import { GetServiceHealthTool } from './tools/implementations/get-service-health.tool';
import { LLM_PROVIDER } from './provider/llm.provider';
import { ToolExecutor } from './tools/tool-executor';
import { PermissionService } from '../security/permission.service';
import { AiLogger } from './observability/ai.logger';
import { PiiRedactionService } from './guardrails/pii-redaction.service';
import { PromptSafetyService } from './guardrails/prompt-safety.service';
import { AiMetrics } from './observability/ai.metrics';

@Module({
  controllers: [
    AiController,
  ],

  providers: [
    AiService,
    GroqProvider,
    ToolRegistry,
    GetServiceHealthTool,
    ToolExecutor,
    PermissionService,
    PiiRedactionService,
    PromptSafetyService,
    AiLogger,
    AiMetrics,

    {
      provide: LLM_PROVIDER,
      useExisting: GroqProvider,
    },
  ],

  exports: [
    AiService,
  ],
})
export class AiModule { }