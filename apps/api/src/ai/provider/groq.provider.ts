import { Injectable } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';

import {
  LlmMessage,
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
    const messages = request.messages.map((message) =>
      this.toLangChainMessage(message),
    );

    const model = request.tools?.length
      ? this.model.bindTools(request.tools)
      : this.model;

    const response = await model.invoke(messages);

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

      rawMessage: response,
    };
  }

  private toLangChainMessage(message: LlmMessage) {
    switch (message.role) {
      case 'system':
        return new SystemMessage(message.content);

      case 'user':
        return new HumanMessage(message.content);

      case 'assistant':
        return new AIMessage({
          content: message.content,

          tool_calls: (message.tool_calls ?? []).map(
            (call) => ({
              id: call.id,
              name: call.name,
              args: call.args,
            }),
          ),
        });

      case 'tool':
        return new ToolMessage({
          content: message.content,
          tool_call_id: message.tool_call_id!,
        });

      default:
        throw new Error(
          `Unsupported message role: ${message.role}`,
        );
    }
  }
}