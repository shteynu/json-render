# Harness Agent Chat Example

**json-render as the UI for agent harnesses.**

This example runs a real coding agent -- Claude Code in a Vercel Sandbox, driven through the AI SDK 7 [`HarnessAgent`](https://vercel.com/changelog/program-agent-harnesses-with-ai-sdk) API -- and renders its work as generative UI instead of a wall of markdown.

The agent edits files, runs commands, and executes tests inside the sandbox. When it reports back, it emits a json-render spec constrained to a catalog of work-report components (`Steps`, `FileChange`, `Terminal`, `TestResults`, `Metric`, ...), which streams into the chat as structured, rendered UI.

## How it works

```
useChat ──► POST /api/agent ──► HarnessAgent (Claude Code + Vercel Sandbox)
   ▲                                       │
   │            result.toUIMessageStream() │
   └──── data-spec parts ◄── pipeJsonRender ◄──┘
```

1. `lib/agent.ts` constructs a module-scope `HarnessAgent` with the `claudeCode` harness and a Vercel sandbox provider. The agent's `instructions` embed `agentReportCatalog.prompt({ mode: "inline" })`, teaching the runtime to wrap its UI report in a ` ```spec ` fence.
2. `app/api/agent/route.ts` keeps one live harness session per chat (the harness owns its own conversation history, so each turn sends only the fresh user message), streams the turn, and pipes it through `pipeJsonRender` -- which extracts the spec fence into typed `data-spec` parts while passing text and tool calls through untouched.
3. `app/page.tsx` renders text with markdown, builtin tool calls (bash, edit, ...) as activity lines, and the spec inline with `<ReportRenderer>` via `useJsonRenderMessage`.

Because `HarnessAgent.stream()` returns a standard AI SDK `StreamTextResult`, the json-render pipeline is identical to the single-model [chat example](../chat) -- swapping a model call for a full agent harness changes nothing about the UI layer.

## Setup

The AI SDK harness packages are **experimental canary releases**; expect breaking changes.

1. Link the project to Vercel so the sandbox provider can authenticate:

   ```bash
   vercel link
   vercel env pull
   ```

2. Provide model credentials for the Claude Code runtime, either:
   - `AI_GATEWAY_API_KEY` (Vercel AI Gateway), or
   - `ANTHROPIC_API_KEY` (Anthropic direct)

3. Optionally set `CLAUDE_CODE_MODEL` (defaults to the Claude Code CLI's default model).

## Run

```bash
pnpm install
pnpm dev
```

Then open `harness-chat-demo.json-render.localhost:1355`.

Note: the first message in a chat boots a fresh sandbox, which takes a while; follow-up messages reuse it. "Start Over" destroys the server-side session and its sandbox; idle sessions are destroyed after 10 minutes.
