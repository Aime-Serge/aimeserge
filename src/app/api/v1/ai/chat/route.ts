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
const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string().min(1).max(10000),
  id: z.string().optional(),
  tool_call_id: z.string().optional(),
  name: z.string().optional(),
});

const chatPayloadSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(100)
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
    const rateLimitResult = await rateLimit.check(30, 60_000, `chat:${clientIP}`);
    
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
      console.error("❌ Invalid Payload:", payload.error);
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
      context = "Initiating secure handshake. Welcome the user.";
    }

    // 5. Stream Response with Vercel AI SDK + Gemini
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const convertedMessages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }> = messages.map(m => {
      if (m.role === 'system') {
        return { role: 'user' as const, content: m.content };
      }
      return { role: m.role as 'user' | 'assistant' | 'tool', content: m.content };
    });

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: getSystemPrompt(context),
      messages: convertedMessages as any,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('❌ AI Node Failure (Streaming):', error);
    return NextResponse.json(
      { error: "Quantum decoherence detected in the streaming node. Secure re-indexing required." },
      { status: 500 }
    );
  }
}
