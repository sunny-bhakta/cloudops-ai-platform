import {
    Inject,
    Injectable,
} from '@nestjs/common';

import {
    LlmProvider,
} from './provider/llm.provider';

import { ToolRegistry } from './tools/tool-registry';

export const LLM_PROVIDER = 'LLM_PROVIDER';

@Injectable()
export class AiService {
    constructor(
        @Inject(LLM_PROVIDER)
        private readonly llmProvider: LlmProvider,

        private readonly toolRegistry: ToolRegistry,
    ) { }

    async chat(message: string) {
        console.log(
            'Available tools:',
            this.toolRegistry.list(),
        );

        return this.llmProvider.chat({
            message,
            systemPrompt:
                'You are an AI assistant for a cloud operations platform.',
        });
    }
}