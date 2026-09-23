export interface AiTool<TInput = unknown, TOutput = unknown> {
  name: string;

  description: string;

  execute(input: TInput): Promise<TOutput>;

  permission: string;

  timeoutMs: number;

  retry: {
    maxAttempts: number;
  };

  idempotent: boolean;
}