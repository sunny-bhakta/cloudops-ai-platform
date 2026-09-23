export interface LlmRequest {
    message: string;
    systemPrompt?: string;
}

export interface LlmResponse {
    content: string;
}

export interface LlmProvider {
    chat(request: LlmRequest): Promise<LlmResponse>;
}