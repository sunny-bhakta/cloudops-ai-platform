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
import { ToolSecurityService } from './tools/tool-security.service.js';
import { ApprovalModule } from './approval/approval.module.js';
import { ToolExecutionService } from './tools/tool-execution.service.js';
import { TriggerDeployTool } from './tools/implementations/trigger-deploy.tool.js';
import { AuthzService } from './guardrails/authz.service.js';
import { PolicyService } from './guardrails/policy.service.js';
import { ToolExecutorService } from './tools/tool-executor.service.js';
import { AuditModule } from './audit/audit.module.js';
import { AuditService } from './audit/audit.service.js';

@Module({
  imports: [
    ApprovalModule,
    AuditModule,
    // TriggerDeployTool
  ],
  controllers: [
    AiController,
  ],

  providers: [
    AuthzService,
    PolicyService,
    ToolExecutionService,
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
    ToolSecurityService,
    TriggerDeployTool,
    ToolExecutorService,

    {
      provide: LLM_PROVIDER,
      useExisting: GroqProvider,
    },
  ],

  exports: [
    AiService,
    ToolSecurityService,
    ToolRegistry,
    ToolExecutor,
    ToolExecutorService,
    AuditService,
  ],
})
export class AiModule { }