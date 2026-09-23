import { Injectable } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';

import {
  LlmProvider,
  LlmRequest,
  LlmResponse,
} from './llm.provider';

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
    const model = request.tools?.length
      ? this.model.bindTools(request.tools)
      : this.model;

    const response = await model.invoke([
      {
        role: 'system',
        content:
          request.systemPrompt ??
          'You are an AI assistant for a cloud operations platform.',
      },
      {
        role: 'user',
        content: request.message,
      },
    ]);

    const toolCalls = response.tool_calls ?? [];

    return {
      content:
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content),

      toolCalls: toolCalls.map((call) => ({
        id: call.id ?? crypto.randomUUID(),
        name: call.name,
        input: call.args as Record<string, unknown>,
      })),
    };
  }
}