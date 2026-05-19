# Hono + Cloudflare Workers AI Anthropic Compatibility Layer

# Detailed Implementation Guide

## Objective

Build an Anthropic-compatible API layer using:

- Cloudflare Workers
- Hono
- Workers AI
- Durable Objects
- KV
- D1

so that tools like:

- Claude Code
- LibreChat
- Continue.dev
- Cline
- Open WebUI

can use:

- Cloudflare Workers AI
- free Workers AI quotas

without modifications.

---

# Architecture Overview

```text
Claude Code / Anthropic Clients
                ↓
        Hono Compatibility Layer
                ↓
        Internal Unified Schema
                ↓
         Workers AI Provider
                ↓
        Cloudflare Workers AI
```

---

# Core Design Principles

## 1. Separate Compatibility Logic from Provider Logic

Avoid directly coupling Anthropic requests to Workers AI.

Preferred architecture:

```text
Anthropic API
    ↓
Normalized Internal Format
    ↓
Workers AI Provider
```

Benefits:

- easier debugging
- future OpenAI support
- easier testing
- cleaner streaming translation
- simpler model routing

---

## 2. Streaming is a First-Class Feature

Claude Code heavily depends on:

- SSE streams
- event ordering
- partial token updates

Streaming should influence the architecture from day one.

---

## 3. Edge-Native Design

Use:

- Fetch API
- Streams API
- lightweight middleware
- stateless request handlers

Avoid Node.js assumptions.

---

# Technology Stack

| Component | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| Framework | Hono |
| Validation | Zod |
| Database | D1 |
| Cache / Config | KV |
| Rate Limiting | Durable Objects |
| Logs | R2 |
| Metrics | Analytics Engine |

---

# Project Setup

## Create Project

```bash
npm create hono@latest inferedge
```

Select:

- Cloudflare Workers
- TypeScript

---

## Install Dependencies

```bash
npm install zod
npm install hono
npm install eventsource-parser
```

Optional:

```bash
npm install pino
npm install nanoid
```

---

# Suggested Repository Structure

```text
src/
├── index.ts
│
├── routes/
│   ├── anthropic.ts
│   ├── models.ts
│   └── health.ts
│
├── anthropic/
│   ├── parser.ts
│   ├── formatter.ts
│   ├── streaming.ts
│   ├── tools.ts
│   ├── schema.ts
│   └── errors.ts
│
├── providers/
│   ├── workers-ai.ts
│   └── types.ts
│
├── internal/
│   ├── messages.ts
│   ├── streaming.ts
│   └── models.ts
│
├── middleware/
│   ├── auth.ts
│   ├── quota.ts
│   ├── logging.ts
│   └── request-id.ts
│
├── storage/
│   ├── kv.ts
│   ├── d1.ts
│   └── r2.ts
│
├── utils/
│   ├── sse.ts
│   ├── tokens.ts
│   ├── logger.ts
│   └── stream.ts
│
└── config/
    ├── models.ts
    └── constants.ts
```

---

# Environment Configuration

## wrangler.toml

```toml
name = "inferedge"
main = "src/index.ts"
compatibility_date = "2026-05-17"

[[kv_namespaces]]
binding = "CONFIG_KV"
id = "xxx"

[[d1_databases]]
binding = "DB"
database_name = "inferedge"
database_id = "xxx"

[[r2_buckets]]
binding = "LOG_BUCKET"
bucket_name = "inferedge-logs"

[vars]
DEFAULT_MODEL = "@cf/qwen/qwen2.5-coder-32b-instruct"
```

---

# Hono Application Setup

## src/index.ts

```ts
import { Hono } from 'hono'
import anthropicRoutes from './routes/anthropic'
import healthRoutes from './routes/health'

const app = new Hono()

app.route('/v1', anthropicRoutes)
app.route('/', healthRoutes)

export default app
```

---

# Anthropic Compatibility Layer

# Phase 1 — Basic Messages Endpoint

## Route

Implement:

```http
POST /v1/messages
```

---

## Request Schema

Use Zod.

Example:

```ts
import { z } from 'zod'

export const MessageRequestSchema = z.object({
  model: z.string(),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional(),
  system: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.any()
    })
  )
})
```

---

# Internal Message Representation

Create a normalized internal schema.

## internal/messages.ts

```ts
export interface InternalMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
```

This becomes the central abstraction.

---

# Message Translation Layer

## anthropic/parser.ts

Responsibilities:

- parse Anthropic messages
- flatten content arrays
- normalize tool blocks
- normalize assistant messages
- extract system prompts

Example:

```ts
export function normalizeAnthropicMessages(body) {
  return []
}
```

---

# Workers AI Provider

## providers/workers-ai.ts

Responsibilities:

- model mapping
- request translation
- Workers AI API calls
- stream handling

---

## Model Mapping

```ts
export const MODEL_MAP = {
  'claude-3-7-sonnet':
    '@cf/qwen/qwen2.5-coder-32b-instruct',

  'claude-3-opus':
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
}
```

---

## Provider Interface

```ts
export interface Provider {
  generate(messages: InternalMessage[]): Promise<any>
  stream(messages: InternalMessage[]): Promise<ReadableStream>
}
```

---

# Workers AI API Integration

Example:

```ts
const response = await env.AI.run(model, {
  messages
})
```

---

# Anthropic Response Formatting

## anthropic/formatter.ts

Responsibilities:

- convert provider responses
- generate Anthropic-compatible output
- attach usage fields
- format IDs

Example response:

```json
{
  "id": "msg_xxx",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello"
    }
  ],
  "model": "claude-3-7-sonnet",
  "stop_reason": "end_turn"
}
```

---

# Streaming Architecture

# Most Important Component

Claude Code compatibility depends heavily on proper streaming.

---

# Streaming Flow

```text
Workers AI Stream
        ↓
Provider Stream Parser
        ↓
Internal Stream Events
        ↓
Anthropic SSE Formatter
        ↓
Claude Code
```

---

# Anthropic SSE Events

You must emit:

```text
message_start
content_block_start
content_block_delta
content_block_stop
message_delta
message_stop
```

---

# SSE Utility

## utils/sse.ts

Create helper functions:

```ts
export function writeEvent(
  writer,
  event,
  data
) {}
```

---

# Streaming Route Example

```ts
return stream(c, async (stream) => {
  await stream.write(...)
})
```

---

# Anthropic Streaming Sequence

Recommended event order:

```text
message_start
content_block_start
content_block_delta
content_block_delta
content_block_stop
message_delta
message_stop
```

Incorrect ordering may break Claude Code.

---

# Tool Calling

# Phase 2 Feature

Claude clients may send:

```json
{
  "tools": [...]
}
```

---

# Tool Compatibility Strategy

Initially:

- parse tools
- pass tool descriptions into prompt
- emulate tool_use blocks

Later:

- native tool execution
- streaming tool results

---

# Error Handling

## anthropic/errors.ts

Implement Anthropic-compatible errors.

Example:

```json
{
  "error": {
    "type": "authentication_error",
    "message": "invalid api key"
  }
}
```

---

# Authentication

# Phase 1

Support:

```http
x-api-key
```

---

# Middleware Example

## middleware/auth.ts

Responsibilities:

- validate API key
- attach user context
- reject unauthorized requests

---

# Quota System

# Phase 3

## Durable Objects

Use Durable Objects for:

- request counters
- rate limiting
- concurrent streams
- token accounting

---

# KV Usage

Use KV for:

- API keys
- user configuration
- model aliases
- quota definitions

Avoid using KV for counters.

---

# D1 Usage

Use D1 for:

- analytics
- usage history
- request metadata
- debugging information

---

# Logging Strategy

## R2

Store:

- failed requests
- debug traces
- stream logs
- provider responses

Useful for debugging Claude Code issues.

---

# Suggested API Endpoints

| Endpoint | Purpose |
|---|---|
| POST /v1/messages | Main Anthropic endpoint |
| GET /v1/models | Model discovery |
| POST /v1/messages/count_tokens | Token estimation |
| GET /health | Health checks |

---

# Model Discovery Endpoint

Return Anthropic-style models.

Example:

```json
{
  "data": [
    {
      "id": "claude-3-7-sonnet"
    }
  ]
}
```

Internally map them to Workers AI models.

---

# Token Counting

Claude clients may call:

```http
POST /v1/messages/count_tokens
```

Initially:

- approximate token counts
- simple character/token heuristic

Later:

- proper tokenizer

---

# Request Logging Middleware

Track:

- latency
- model
- token usage
- stream duration
- response status
- errors

Useful for debugging compatibility issues.

---

# Compatibility Testing

# Critical Phase

Test with:

- Claude Code
- LibreChat
- Open WebUI
- Continue.dev
- Cline

---

# Important Claude Code Behaviors

Claude Code may:

- retry automatically
- probe unsupported endpoints
- validate stream ordering
- validate stop reasons
- expect tool metadata

Expect trial-and-error debugging.

---

# Recommended Development Order

## Phase 1

- Hono setup
- `/v1/messages`
- request validation
- model mapping
- basic Workers AI integration
- non-streaming responses

---

## Phase 2

- SSE infrastructure
- streaming translation
- Anthropic event ordering
- stream stability testing

---

## Phase 3

- tool calling
- token counting
- model discovery
- error compatibility

---

## Phase 4

- rate limiting
- quotas
- analytics
- logging

---

## Phase 5

- WARP integration
- Zero Trust auth
- private APIs

---

# Performance Considerations

## Avoid Large Buffers

Always stream incrementally.

Do not accumulate entire responses in memory.

---

## Reduce JSON Serialization

Streaming performance matters.

Avoid excessive:

- stringify calls
- deep cloning
- schema transformations

inside stream loops.

---

## Use Lightweight Middleware

Workers CPU time is limited.

Keep middleware minimal.

---

# Important Edge Cases

## Empty Responses

Some Workers AI models may:

- return empty chunks
- terminate streams early
- emit malformed JSON

Handle gracefully.

---

## Tool Call Hallucinations

Workers AI models may not follow Anthropic tool format correctly.

Expect normalization work.

---

## Long Context Windows

Claude clients may send very large prompts.

Implement:

- context truncation
- max token guards
- prompt validation

---

# Recommended Initial Models

## Coding

```text
@cf/qwen/qwen2.5-coder-32b-instruct
```

---

## General Fallback

```text
@cf/meta/llama-3.3-70b-instruct-fp8-fast
```

---

# Success Criteria

## MVP

Claude Code can:

- connect
- stream responses
- edit code
- complete prompts

using:

- Workers AI
- free Cloudflare quotas

without modifications.

---

# Long-Term Vision

Potential future expansion:

- OpenAI compatibility
- Gemini compatibility
- local model routing
- provider failover
- WARP-native authentication
- unified developer AI runtime
