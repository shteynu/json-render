import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { generateGameAIPrompt } from "@/lib/ai-game-prompt";

export async function POST(req: Request) {
  const { prompt, objects, previousPrompts } = await req.json();

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const sceneObjects = Array.isArray(objects) ? objects : [];

  const result = streamText({
    model: gateway(
      process.env.AI_GATEWAY_MODEL || "anthropic/claude-sonnet-4-6",
    ),
    prompt: generateGameAIPrompt(prompt, sceneObjects, previousPrompts || []),
    temperature: 0.2,
  });

  return result.toTextStreamResponse();
}
