import { assembleAIContext, getSystemPrompt } from "@/core/domain/ai/queries";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";
import { rateLimit } from "@/infrastructure/security/rateLimit";
import { redactPII } from "@/infrastructure/security/piiFilter";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = 'edge';

// Input validation schema
// Visitors may only send user/assistant turns. Allowing "system" or "tool"
// roles from the browser lets anyone inject instructions into the model.
const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
  id: z.string().max(100).optional(),
});

// Keep only the last 20 turns: enough context, bounded cost per request.
const chatPayloadSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40).transform((m) => m.slice(-20)),
});

export async function POST(req: NextRequest) {
  try {
    // 0. Validate Content-Type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected application/json" },
        { status: 400 }
      );
    }

    // 1. Rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rateLimitResult = await rateLimit.check(15, 60_000, `chat:${clientIP}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please retry shortly." },
        { status: 429 }
      );
    }

    // 2. Parse and validate payload
    const rawPayload = await req.json();
    const payload = chatPayloadSchema.safeParse(rawPayload);
    
    if (!payload.success) {
      console.error("Invalid chat payload:", payload.error.issues);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const messages = payload.data.messages;

    // 3. Extract and Redact Query (Security Hardening)
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const rawUserQuery = lastUserMessage?.content || "";
    const userQuery = redactPII(rawUserQuery);

    // 4. Assemble RAG Context
    let context = "";
    if (userQuery) {
      context = await assembleAIContext(userQuery);
    } else {
      context = "No question yet. Greet the visitor in one short sentence.";
    }

    // 5. Stream Response with Vercel AI SDK + Gemini
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const convertedMessages = messages.map((m) => ({ role: m.role, content: m.content }));

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: getSystemPrompt(context),
      messages: convertedMessages,
      maxOutputTokens: 800,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('❌ AI Node Failure (Streaming):', error);
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try again in a minute." },
      { status: 500 }
    );
  }
}
