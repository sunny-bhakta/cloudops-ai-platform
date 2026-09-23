# AI-Native Single-Repo Implementation Blueprint (Without Kubernetes)

This guide gives you a practical, senior-level path to implement AI-native features in a **single repository**.

It is optimized for your stack direction:
- AWS
- Terraform
- ECS/Fargate (no K8s required)
- NestJS services
- GitHub Actions CI/CD

---

## 1) Target Architecture (High Level)

Use **one repository with clear internal boundaries**:

1. **Application Layer**
    - Business APIs (NestJS)
    - AI orchestration endpoint(s)
    - Tool-calling layer and safety checks

2. **Infrastructure Layer**
    - Terraform modules and environments
    - IAM, networking, ECS services, Secrets Manager
    - Monitoring, alarms, dashboards

3. **Platform/Ops Layer**
    - Shared CI workflows/templates
    - Runbooks, incident playbooks, SLO definitions
    - Security/compliance checks and policies

4. **Knowledge Layer (Optional)**
    - Curated docs/runbooks for RAG ingestion
    - Versioned source-of-truth documents

This gives you repo simplicity while keeping strong separation of concerns.

---

## 2) What “AI-Native” Means in Production

Your app should support these capabilities:
- Natural language requests from users/operators
- Tool calling for safe actions (read status, trigger workflow, create ticket)
- Grounded responses using internal context (RAG where needed)
- Observability (latency, error rate, token/cost, tool-call success)
- Guardrails (auth, RBAC, validation, approvals for risky operations)

---

## 3) Single-Repo Contract (Very Important)

Define and freeze these contracts early:

### A) API Contract
- Input DTO for AI request
- Output DTO with:
   - final response
   - citations/context sources
   - tool actions performed
   - confidence/safety metadata

### B) Tool Contract
Each tool must declare:
- `name`
- `description`
- JSON schema for input
- permission scope
- timeout + retry policy
- idempotency behavior

### C) Security Contract
- Which roles can call which tools
- Which tools need human approval
- What must be masked in logs

### D) Repo Structure Contract
- Clear ownership per top-level folder
- No cross-layer coupling without interfaces
- CI checks enforce boundaries (e.g., app cannot directly mutate terraform state)

---

## 4) Single-Repo Implementation Plan

## A. Repository Layout

```text
cloudops-ai-platform/
   apps/
      api/
         src/
            ai/
               ai.controller.ts
               ai.service.ts
               provider/
                  llm.provider.ts
                  bedrock.provider.ts (or openai/anthropic)
               tools/
                  tool-registry.ts
                  tools.types.ts
                  implementations/
                     get-service-health.tool.ts
                     create-incident.tool.ts
                     trigger-deploy.tool.ts
               guardrails/
                  authz.guard.ts
                  prompt-safety.service.ts
                  pii-redaction.service.ts
               observability/
                  ai.metrics.ts
                  ai.logger.ts

   infra/
      terraform/
         modules/
         envs/
            dev/
            stage/
            prod/

   ops/
      runbooks/
      slo/
      incident-templates/

   knowledge/ (optional)
      docs/
      runbooks/

   .github/
      workflows/
         ci.yml
         terraform-plan.yml
         terraform-apply.yml
         security.yml
```

---

## B. Application Checklist (NestJS)

### Deliverables
- [ ] `POST /ai/chat` endpoint
- [ ] Provider abstraction (swap model providers without business code change)
- [ ] Tool registry with schema validation
- [ ] RBAC per tool
- [ ] Correlation ID across request -> tool call -> final response
- [ ] Structured logging for audit

### Minimum test coverage
- [ ] Happy path: AI returns answer without tool
- [ ] Tool path: AI requests tool and tool executes
- [ ] Denied tool path: unauthorized action blocked
- [ ] Timeout/fallback path

---

## C. Infrastructure Checklist (Terraform + AWS)

### Modules/environments to ensure
- [ ] VPC + private subnets
- [ ] ECS Fargate service + autoscaling
- [ ] IAM roles (task role, execution role, least privilege)
- [ ] Secrets Manager for model/API keys
- [ ] CloudWatch logs, metrics, alarms
- [ ] Optional queue (SQS) for async long-running tool tasks
- [ ] Optional vector data store (OpenSearch Serverless / pgvector / managed DB)

### Guardrails in Terraform
- [ ] Enforce tags for cost allocation
- [ ] CloudWatch alarm for 5xx and latency
- [ ] Alarm for AI cost/token spikes (custom metric)
- [ ] No public exposure unless explicitly required

---

## D. Platform/Ops Checklist

### CI/CD standards
- [ ] Reusable workflows for lint/test/build
- [ ] Security checks: SAST + dependency + secrets scan
- [ ] IaC scan (Terraform security policy)
- [ ] Deployment promotion gates (dev -> stage -> prod)

### Operations standards
- [ ] SLO/SLI docs for AI endpoint
- [ ] Runbook: model outage fallback
- [ ] Runbook: tool-call failure and rollback
- [ ] Incident template with postmortem format

---

## 5) Suggested Tool Set (Start Small)

Implement only 3 tools first:

1. `getServiceHealth`
    - Read-only, no approval
2. `createIncident`
    - Writes to incident system, no destructive infra change
3. `triggerDeploy`
    - Requires approval + strict allow-list

Then expand tool set after stability is proven.

---

## 6) Security and Safety Baseline

Must-have controls before production:
- [ ] Input validation on every tool schema
- [ ] Prompt injection defense (instruction boundary + allow-listed actions)
- [ ] PII detection/redaction in logs
- [ ] Secrets never returned to model/user
- [ ] Per-user and per-tenant rate limits
- [ ] Human approval workflow for destructive operations

---

## 7) Observability and Quality Gates

Track these metrics from day 1:
- Request latency (p50/p95/p99)
- Tool call success/failure rate
- Hallucination/grounding failure signals
- Token usage and cost per request
- Fallback rate (primary model -> backup model)

Release gate for production:
- [ ] Build: pass
- [ ] Lint/Typecheck: pass
- [ ] Unit/integration tests: pass
- [ ] Smoke test `/ai/chat`: pass

---

## 8) 30-60-90 Day Execution Plan

## Days 1-30 (Foundation)
- Build AI endpoint + provider abstraction
- Add 1 read-only tool
- Add logs, metrics, and basic authz
- Establish folder ownership and CI boundaries in one repo

## Days 31-60 (Controlled Actions)
- Add 2nd and 3rd tools
- Add approval workflow for risky tools
- Add RAG for internal docs/runbooks
- Harden Terraform promotion path (dev -> stage)

## Days 61-90 (Production Maturity)
- SLO enforcement and incident drills
- Cost optimization (caching/routing/fallback)
- Repo-wide standards adoption (CODEOWNERS, policy checks)

---

## 9) Definition of Done (Single Repo)

### App Layer DoD
- [ ] AI endpoint stable under expected load
- [ ] Tool calling works with audit logs
- [ ] Unauthorized tool calls blocked
- [ ] Tests cover happy + failure paths

### Infra Layer DoD
- [ ] Repeatable terraform apply across envs
- [ ] Secrets, IAM, alarms correctly configured
- [ ] ECS rollback strategy validated

### Ops Layer DoD
- [ ] CI workflows enforce standards across folders
- [ ] Runbooks and SLO docs published
- [ ] Incident simulation completed once

---

## 10) First PR Sequence You Can Open (Single Repo)

1. **PR-1**: add `/apps/api` AI module + provider abstraction + `getServiceHealth` tool
2. **PR-2**: add `/infra/terraform` secrets + IAM least privilege + CloudWatch alarms
3. **PR-3**: add `/ops` runbooks + SLO docs + security CI workflows
4. **PR-4**: add approval-required `triggerDeploy` tool and policy gates

This sequence minimizes risk and gives visible progress quickly.

---

## 11) Common Failure Modes (Avoid These)

- Mixing app logic and terraform logic in the same paths
- Too many tools at once before guardrails
- No clear permission model
- Missing timeout/retry/idempotency rules
- Weak observability (cannot explain failures)
- Treating LLM output as trusted without validation

---

## 12) Nice-to-Have Enhancements (After Baseline)

- Model router (cheap model for simple tasks, premium for complex)
- Prompt/version registry with A/B experiments
- Offline evaluation suite with golden datasets
- Multi-region failover for critical AI operations

---

## Quick Start Decision

If you want the fastest path, start with:
- One repository with `apps`, `infra`, and `ops` folders
- One read-only tool
- One risky tool with approval

Then scale capabilities inside the same repo using strict boundaries and CI policy checks.

That gives you real AI-native capability with production safety, without Kubernetes.

---

## 13) PR-1 Execution Checklist (File-by-File, Start Here)

Goal of PR-1: deliver one safe vertical slice in `apps/api`:
- `POST /ai/chat`
- provider abstraction
- one read-only tool: `getServiceHealth`

### A. Create/Update in `apps/api/src/ai`

- [ ] `ai.controller.ts`
   - Add `POST /ai/chat`
   - Validate request DTO
   - Pass correlation ID to service

- [ ] `ai.service.ts`
   - Call provider abstraction first
   - Support tool-call execution path
   - Return normalized response payload

- [ ] `provider/llm.provider.ts`
   - Define provider interface (generate + optional tool intent)

- [ ] `provider/bedrock.provider.ts` (or your selected provider)
   - Implement `llm.provider.ts`
   - Add timeout and basic retry policy

### B. Tooling contract and first tool

- [ ] `tools/tools.types.ts`
   - Define tool input/output types
   - Include timeout/retry/idempotency metadata

- [ ] `tools/tool-registry.ts`
   - Register tools and input schema
   - Enforce schema validation before execution

- [ ] `tools/implementations/get-service-health.tool.ts`
   - Implement read-only health check
   - Return stable machine-friendly payload

### C. Guardrails and observability (minimum)

- [ ] `guardrails/authz.guard.ts`
   - Enforce RBAC per tool name

- [ ] `guardrails/prompt-safety.service.ts`
   - Add instruction boundary + allow-listed actions only

- [ ] `guardrails/pii-redaction.service.ts`
   - Redact sensitive fields before logging

- [ ] `observability/ai.logger.ts`
   - Structured logs: request ID, user/tenant, tool events, outcome

- [ ] `observability/ai.metrics.ts`
   - Latency, tool success/failure, fallback counter

### D. Minimum test set before merging PR-1

- [ ] Happy path: answer without tool
- [ ] Tool path: tool executes successfully
- [ ] Denied tool path: unauthorized tool blocked
- [ ] Timeout/fallback path: provider/tool timeout handled

### E. PR-1 merge criteria

- [ ] Build passes
- [ ] Lint/typecheck pass
- [ ] Tests pass
- [ ] `/ai/chat` smoke test passes
- [ ] Audit log includes correlation ID end-to-end
