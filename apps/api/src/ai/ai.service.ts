import {
    Inject,
    Injectable,
} from '@nestjs/common';

import {
    LlmProvider,
} from './provider/llm.provider';

import {
    ToolRegistry,
} from './tools/tool-registry';

export const LLM_PROVIDER = 'LLM_PROVIDER';

@Injectable()
export class AiService {
    constructor(
        @Inject(LLM_PROVIDER)
        private readonly llmProvider: LlmProvider,

        private readonly toolRegistry: ToolRegistry,
    ) { }

    async chat(message: string) {
        const tools = this.toolRegistry
            .list()
            .map((name) => {
                const tool = this.toolRegistry.get(name);

                if (!tool) {
                    return null;
                }

                return {
                    type: 'function' as const,
                    function: {
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.inputSchema,
                    },
                };
            })
            .filter(
                (
                    tool,
                ): tool is {
                    type: 'function';
                    function: {
                        name: string;
                        description: string;
                        parameters: Record<string, unknown>;
                    };
                } => tool !== null,
            );

        let response = await this.llmProvider.chat({
            message,

            systemPrompt:
                'You are an AI assistant for a cloud operations platform. ' +
                'Use available tools when they are required to answer the user. ' +
                'Do not invent tool results.',

            tools,
        });

        const toolActions: unknown[] = [];

        if (response.toolCalls?.length) {
            for (const toolCall of response.toolCalls) {
                const tool = this.toolRegistry.get(toolCall.name);

                if (!tool) {
                    throw new Error(
                        `Unknown AI tool: ${toolCall.name}`,
                    );
                }

                console.log(
                    `Executing AI tool: ${toolCall.name}`,
                    toolCall.input,
                );

                const result = await tool.execute(
                    toolCall.input,
                );

                toolActions.push({
                    tool: toolCall.name,
                    input: toolCall.input,
                    result,
                });

                /*
                 * For the first version we will return the
                 * tool result so we can verify the tool path.
                 */
            }
        }

        return {
            content: response.content,
            toolActions,
        };
    }
}