import { ToolExecutor } from "./tool-executor.js";
import { AiTool } from "./tools.types.js";

describe('ToolExecutor', () => {
    // let toolExecutor: ToolExecutor;

    // beforeEach(() => {
    //     toolExecutor = new ToolExecutor();
    // });

    // it('should execute a tool and return the result', async () => {
    //     const tool: AiTool<{ service: string }, { status: string }> = {
    //         name: 'getServiceHealth',

    //         description: 'Check service health',

    //         inputSchema: {
    //             type: 'object',
    //             properties: {
    //                 service: {
    //                     type: 'string',
    //                 },
    //             },
    //             required: ['service'],
    //             additionalProperties: false,
    //         },

    //         permission: 'service:health:read',

    //         timeoutMs: 3000,

    //         retry: {
    //             maxAttempts: 2,
    //         },

    //         idempotent: true,

    //         execute: async (input) => ({
    //             status: `healthy:${input.service}`,
    //         }),
    //     };

    //     const result = await toolExecutor.execute(tool, { service: 'payments' });
    //     expect(result).toEqual({ status: 'healthy:payments' });
    // });

})