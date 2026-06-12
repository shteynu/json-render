import {
  HarnessAgent,
  type HarnessAgentAdapter,
  type HarnessAgentSession,
} from "@ai-sdk/harness/agent";
import { createClaudeCode } from "@ai-sdk/harness-claude-code";
import { createVercelSandbox } from "@ai-sdk/sandbox-vercel";
import { agentReportCatalog } from "./render/catalog";

const AGENT_INSTRUCTIONS = `You are a coding agent running inside a fresh Linux sandbox with Node.js available. The user gives you software tasks; you do the work with your tools (bash, file edits, web search), then report back.

REPORTING:
Your chat output is rendered in a web UI that understands a JSON component spec. After finishing the work for a turn:
1. Write one or two short conversational sentences about the outcome.
2. Then output a UI report as a JSONL spec wrapped in a \`\`\`spec fence.

Make the report reflect what actually happened, drawing from your real session:
- Steps for the plan you executed (statuses: done/error; use active/pending only if work remains).
- FileChange entries for files you created, modified, or deleted.
- Terminal for important commands you ran and their real output (trim long output).
- TestResults when you ran a test suite.
- Metric for headline numbers (files changed, tests passed, duration).
- CodeBlock for the key snippet worth showing, with the file path as title.
- Callout for risks, caveats, or suggested follow-ups.
- Group sections with Card; never nest Cards.

Never invent results. If something failed, show it (error step, non-zero exit, failed tests) and say what you would try next.

${agentReportCatalog.prompt({
  mode: "inline",
  customRules: [
    "Keep reports compact and information-dense; the UI renders inside a chat thread.",
    "Prefer Grid with columns='2' or '3' for Metric rows.",
    "Use real command output captured during the session in Terminal components.",
  ],
})}`;

const auth = process.env.AI_GATEWAY_API_KEY
  ? { gateway: { apiKey: process.env.AI_GATEWAY_API_KEY } }
  : process.env.ANTHROPIC_API_KEY
    ? { anthropic: { apiKey: process.env.ANTHROPIC_API_KEY } }
    : undefined;

export const agent = new HarnessAgent({
  // Cast needed on current canaries: @ai-sdk/harness-claude-code pins zod@3
  // while the rest of the tree resolves zod@4, so its HarnessV1 type carries
  // a different @ai-sdk/provider-utils instance. Type-level only.
  harness: createClaudeCode({
    auth,
    model: process.env.CLAUDE_CODE_MODEL,
  }) as unknown as HarnessAgentAdapter,
  sandbox: createVercelSandbox({
    runtime: "node24",
    ports: [3000],
  }),
  instructions: AGENT_INSTRUCTIONS,
});

/**
 * One live harness session per chat. A session owns the sandbox and the
 * runtime's own conversation history, so follow-up messages in the same
 * chat keep working against the same workspace.
 *
 * In-memory only -- fine for a dev-server example. A production app would
 * persist `session.detach()` state and resume by sessionId instead.
 */
const sessions = new Map<
  string,
  { session: HarnessAgentSession; expireTimer: NodeJS.Timeout }
>();

const SESSION_IDLE_MS = 10 * 60 * 1000;

export async function getSession(chatId: string): Promise<HarnessAgentSession> {
  const existing = sessions.get(chatId);
  if (existing) {
    existing.expireTimer.refresh();
    return existing.session;
  }

  const session = await agent.createSession();
  const expireTimer = setTimeout(() => {
    sessions.delete(chatId);
    session.destroy().catch(() => {});
  }, SESSION_IDLE_MS);
  expireTimer.unref?.();
  sessions.set(chatId, { session, expireTimer });
  return session;
}

export function dropSession(chatId: string): void {
  const entry = sessions.get(chatId);
  if (!entry) return;
  clearTimeout(entry.expireTimer);
  sessions.delete(chatId);
  entry.session.destroy().catch(() => {});
}
