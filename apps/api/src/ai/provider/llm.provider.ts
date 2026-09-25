export interface LlmTool {
  type: 'function';

  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface LlmToolCallMessage {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;

  tool_call_id?: string;

  tool_calls?: LlmToolCallMessage[];
}

export interface LlmRequest {
  messages: LlmMessage[];
  tools?: LlmTool[];
}

export interface LlmToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface LlmResponse {
  content: string;
  toolCalls: LlmToolCall[];
  rawMessage?: unknown;
}

export interface LlmProvider {
  chat(request: LlmRequest): Promise<LlmResponse>;
}

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');