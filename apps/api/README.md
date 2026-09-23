# apps/api - PR-1 AI Module Scaffold

This NestJS + TypeScript service implements the PR-1 vertical slice:

- `POST /ai/chat`
- Provider abstraction (`llm.provider.ts` + `bedrock.provider.ts`)
- Tool registry with schema validation
- First read-only tool: `getServiceHealth`
- Basic guardrails (RBAC, prompt safety, PII log redaction)
- Basic observability hooks (structured logs + metrics counters)

## Local development

1. Install dependencies
2. Run tests
3. Run the app

## API contract (current)

### Request

```json
{
  "prompt": "check health status of api",
  "context": {
    "tenantId": "acme"
  }
}
```

### Response

```json
{
  "response": "I will check service health before finalizing.",
  "citations": [],
  "toolActions": [
    {
      "name": "getServiceHealth",
      "status": "success",
      "output": {
        "service": "api",
        "status": "ok"
      }
    }
  ],
  "metadata": {
    "model": "bedrock-mock-v1",
    "confidence": 0.8,
    "fallbackUsed": false,
    "correlationId": "..."
  }
}
```

## Notes

- Current provider is a mock behavior layer for safe local development.
- Replace `bedrock.provider.ts` internals with real AWS Bedrock invocation in PR-2/PR-3.