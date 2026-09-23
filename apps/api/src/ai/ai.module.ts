import { Module } from '@nestjs/common';

import { AiController } from './ai.controller';
import { AiService, LLM_PROVIDER } from './ai.service';

import { GroqProvider } from './provider/groq.provider';

import { ToolRegistry } from './tools/tool-registry';

import { GetServiceHealthTool } from './tools/implementations/get-service-health.tool';

@Module({
  controllers: [
    AiController,
  ],

  providers: [
    AiService,

    GroqProvider,

    ToolRegistry,

    GetServiceHealthTool,

    {
      provide: LLM_PROVIDER,
      useExisting: GroqProvider,
    },
  ],

  exports: [
    AiService,
  ],
})
export class AiModule {}