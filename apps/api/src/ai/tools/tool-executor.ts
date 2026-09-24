import { Injectable } from '@nestjs/common';
import Ajv, { ValidateFunction } from 'ajv';
import { AiTool } from './tools.types';
import { PermissionService } from '../../security/permission.service';

@Injectable()
export class ToolExecutor {
  private readonly ajv = new Ajv({
    allErrors: true,
    strict: false,
  });

  private readonly validators = new Map<
    string,
    ValidateFunction
  >();

  constructor(  private readonly permissionService: PermissionService,) {}

async execute<TInput, TOutput>(
  tool: AiTool<TInput, TOutput>,
  input: TInput,
  userPermissions: string[] = [],
): Promise<TOutput> {
  if (
    !this.permissionService.hasPermission(
      tool.permission,
      userPermissions,
    )
  ) {
    throw new Error(
      `Permission denied for AI tool "${tool.name}". ` +
        `Required permission: ${tool.permission}`,
    );
  }

  this.validateInput(tool, input);

  const maxAttempts = tool.idempotent
    ? Math.max(1, tool.retry.maxAttempts)
    : 1;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await this.executeWithTimeout(
        tool,
        input,
      );
    } catch (error) {
      lastError = error;

      console.error(
        `AI tool ${tool.name} failed ` +
          `(attempt ${attempt}/${maxAttempts})`,
        error,
      );

      if (attempt === maxAttempts) {
        break;
      }
    }
  }

  throw lastError;
}

  private validateInput<TInput>(
    tool: AiTool<TInput, unknown>,
    input: TInput,
  ): void {
    let validator = this.validators.get(tool.name);

    if (!validator) {
      validator = this.ajv.compile(tool.inputSchema);
      this.validators.set(tool.name, validator);
    }

    const valid = validator(input);

    if (!valid) {
      throw new Error(
        `Invalid input for AI tool "${tool.name}": ` +
          this.ajv.errorsText(validator.errors),
      );
    }
  }

  private async executeWithTimeout<TInput, TOutput>(
    tool: AiTool<TInput, TOutput>,
    input: TInput,
  ): Promise<TOutput> {
    return Promise.race([
      tool.execute(input),

      new Promise<TOutput>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `AI tool "${tool.name}" timed out after ` +
                `${tool.timeoutMs}ms`,
            ),
          );
        }, tool.timeoutMs);
      }),
    ]);
  }
}