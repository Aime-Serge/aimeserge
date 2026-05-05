import { assembleAIContext, getSystemPrompt } from "@/core/domain/ai/queries";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExternalSyncService } from "@/core/application/use-cases/ExternalSyncService";
import { z } from "zod";
import { rateLimit } from "@/infrastructure/security/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ChatMessage {
  role: string;
  content: string;
}

// Input validation schema
const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(5000)
});

const chatPayloadSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50)
});

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = payload.data.messages;

    // 3. Extract Query
    const lastUserMessage = messages.findLast((m) => m.role === 'user');
    const userQuery = lastUserMessage?.content || "";

    // 4. Assemble RAG Context
    let context = "";
    if (userQuery) {
      context = await assembleAIContext(userQuery);
    } else {
      context = "Initiating secure handshake. Welcome the user.";
    }

    // 5. Initialize Gemini 1.5 Flash with Tools
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      tools: [{
        functionDeclarations: [
          {
            name: "syncExternalData",
            description: "Synchronizes the AI's knowledge base with external sources like GitHub and Social Media (LinkedIn) to ensure the Digital Twin has the latest project and career updates.",
          }
        ]
      }],
      systemInstruction: getSystemPrompt(context)
    });

    // 6. Transform history for Gemini
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // 7. Generate Response
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userQuery);
    const response = result.response;
    
    // Check for function calls
    const call = response.functionCalls()?.[0];
    if (call && call.name === "syncExternalData") {
      console.log("🤖 AI Triggered Synchronization...");
      const syncService = new ExternalSyncService();
      const syncResult = await syncService.syncAll();
      
      // Send the tool result back to the AI for final response
      const toolResponse = await chat.sendMessage([
        {
          functionResponse: {
            name: "syncExternalData",
            response: syncResult
          }
        }
      ]);
      
      return NextResponse.json({ 
        id: Date.now().toString(),
        role: 'assistant',
        content: toolResponse.response.text(),
        metadata: { synced: true, results: syncResult }
      });
    }

    return NextResponse.json({ 
      id: Date.now().toString(),
      role: 'assistant',
      content: response.text() 
    });

  } catch (error) {
    console.error('❌ AI Node Failure (Gemini):', error);
    return NextResponse.json(
      { error: "Quantum decoherence detected. Secure node re-indexing required." },
      { status: 500 }
    );
  }
}
