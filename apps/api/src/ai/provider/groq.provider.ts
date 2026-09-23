import { Injectable } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { LlmProvider, LlmRequest, LlmResponse } from './llm.provider';

@Injectable()
export class GroqProvider implements LlmProvider {
    private readonly model: ChatGroq;
    constructor() {
        this.model = new ChatGroq({
            model: 'openai/gpt-oss-20b',
            temperature: 0,
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    async chat(request: LlmRequest): Promise<LlmResponse> {
        const response = await this.model.invoke([
            {
                role: 'system',
                content: request.systemPrompt || 'You are a helpful assistant.',
            },
            {
                role: 'user',
                content: request.message,
            },
        ])

        return {
            content:
                typeof response.content === 'string'
                    ? response.content
                    : JSON.stringify(response.content),
        };
    }
}