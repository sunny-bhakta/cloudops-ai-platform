import { Injectable } from "@nestjs/common";
import { GetServiceHealthTool } from "./implementations/get-service-health.tool";
import { AiTool } from "./tools.types";

@Injectable()
export class ToolRegistry {
    private readonly tools = new Map<string, AiTool>();

    constructor(
        private readonly getServiceHealthTool: GetServiceHealthTool,
    ) {
        this.register(getServiceHealthTool);
    }

    register(tool: AiTool): void {
        this.tools.set(tool.name, tool);
    }

    get(name: string): AiTool | undefined {
        return this.tools.get(name);
    }

    has(name: string): boolean {
        return this.tools.has(name);
    }

    list(): string[] {
        return Array.from(this.tools.keys());
    }
}