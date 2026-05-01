import { assembleAIContext, getSystemPrompt } from "@/domain/ai/queries";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  isTextUIPart,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as { messages?: UIMessage[] };
    const messages = Array.isArray(payload.messages) ? payload.messages : [];

    // 1. Extract Query
    const lastUserMessage = messages.findLast((m) => m.role === 'user');
    const userQuery = lastUserMessage
      ? lastUserMessage.parts
          .filter(isTextUIPart)
          .map((part) => part.text)
          .join(" ")
          .trim()
      : "";

    // 2. Assemble RAG Context
    let context = "";
    if (userQuery) {
      context = await assembleAIContext(userQuery);
    } else {
      context = "Initiating secure handshake. Welcome the user.";
    }

    // 3. Stream Response
    const result = streamText({
      model: openai("gpt-4o"),
      system: getSystemPrompt(context),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('❌ AI Node Failure:', error);
    return new Response(
      JSON.stringify({ error: "Quantum decoherence detected. Secure node re-indexing required." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
