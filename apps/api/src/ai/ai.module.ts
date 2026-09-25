import { Module } from '@nestjs/common';

import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

import { GroqProvider } from './provider/groq.provider.js';

import { ToolRegistry } from './tools/tool-registry.js';

import { GetServiceHealthTool } from './tools/implementations/get-service-health.tool.js';
import { LLM_PROVIDER } from './provider/llm.provider.js';
import { ToolExecutor } from './tools/tool-executor.js';
import { PermissionService } from '../security/permission.service.js';
import { AiLogger } from './observability/ai.logger.js';
import { PiiRedactionService } from './guardrails/pii-redaction.service.js';
import { PromptSafetyService } from './guardrails/prompt-safety.service.js';
import { AiMetrics } from './observability/ai.metrics.js';

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