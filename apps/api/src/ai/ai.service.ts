import {
    Inject,
    Injectable,
} from '@nestjs/common';

import {
    LLM_PROVIDER,
    LlmMessage,
    LlmProvider,
} from './provider/llm.provider';

import {
    ToolRegistry,
} from './tools/tool-registry';

@Injectable()
export class AiService {
    private readonly MAX_TOOL_ITERATIONS = 5;

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

        const messages: LlmMessage[] = [
            {
                role: 'system',
                content:
                    'You are an AI assistant for a cloud operations platform. ' +
                    'Use available tools when required to answer the user. ' +
                    'Never invent tool results.',
            },

            {
                role: 'user',
                content: message,
            },
        ];

        const toolActions: unknown[] = [];

        for (
            let iteration = 0;
            iteration < this.MAX_TOOL_ITERATIONS;
            iteration++
        ) {
            console.log(
                `AI iteration ${iteration + 1}`,
            );

            const response =
                await this.llmProvider.chat({
                    messages,
                    tools,
                });

            /*
             * No tool requested.
             *
             * This is the final AI answer.
             */
            if (!response.toolCalls.length) {
                return {
                    content: response.content,
                    toolActions,
                };
            }

            /*
             * Add the assistant's tool request
             * to the conversation.
             */
            messages.push({
                role: 'assistant',
                content: response.content ?? '',

                tool_calls: response.toolCalls.map((toolCall) => ({
                    id: toolCall.id,
                    name: toolCall.name,
                    args: toolCall.input,
                })),
            });

            /*
             * Execute every requested tool.
             */
            for (const toolCall of response.toolCalls) {
                const tool = this.toolRegistry.get(
                    toolCall.name,
                );

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
                 * Add tool result to conversation.
                 */
                messages.push({
                    role: 'tool',
                    content: JSON.stringify(result),
                    tool_call_id: toolCall.id,
                });
            }

            /*
             * Loop continues.
             *
             * Groq now receives:
             *
             * user
             * assistant tool call
             * tool result
             *
             * and can produce the final answer.
             */
        }

        throw new Error(
            `AI exceeded maximum tool iterations (${this.MAX_TOOL_ITERATIONS})`,
        );
    }
}