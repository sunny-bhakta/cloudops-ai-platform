export interface LlmTool {
  type: 'function';

  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface LlmRequest {
  message: string;
  systemPrompt?: string;
  tools?: LlmTool[];
}

export interface LlmToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface LlmResponse {
  content: string;
  toolCalls?: LlmToolCall[];
}

export interface LlmProvider {
  chat(request: LlmRequest): Promise<LlmResponse>;
}

export const LLM_PROVIDER = 'LLM_PROVIDER';