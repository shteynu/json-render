import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { generateSystemPrompt, generateUserPrompt } from "@/lib/ai-prompt";

export async function POST(req: Request) {
  const { prompt, spec, previousPrompts } = await req.json();

  const result = streamText({
    model: gateway(
      process.env.AI_GATEWAY_MODEL || "anthropic/claude-sonnet-4-6",
    ),
    system: generateSystemPrompt(),
    prompt: generateUserPrompt(prompt, spec, previousPrompts),
  });

  return result.toTextStreamResponse();
}
