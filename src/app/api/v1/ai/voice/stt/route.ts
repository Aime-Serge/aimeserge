import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { rateLimit } from "@/infrastructure/security/rateLimit";

export const runtime = "edge";

const MAX_AUDIO_BYTES = 2 * 1024 * 1024; // ~60 s of compressed voice

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const limit = await rateLimit.check(10, 60_000, `stt:${ip}`);
  if (!limit.success) {
    return new Response("Too many voice requests. Please wait a minute.", { status: 429 });
  }

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_AUDIO_BYTES + 64 * 1024) {
    return new Response("Audio is too long.", { status: 413 });
  }

  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio");

    if (!(audioBlob instanceof Blob)) {
      return new Response("Audio blob is required", { status: 400 });
    }
    if (audioBlob.size > MAX_AUDIO_BYTES) {
      return new Response("Audio is too long.", { status: 413 });
    }
    if (audioBlob.type && !audioBlob.type.startsWith("audio/")) {
      return new Response("Only audio files are accepted.", { status: 415 });
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const audioBuffer = await audioBlob.arrayBuffer();

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      maxOutputTokens: 400,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this audio exactly. Return only the transcript." },
            {
              type: "file",
              data: audioBuffer,
              mediaType: audioBlob.type || "audio/wav",
            },
          ],
        },
      ],
    });

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("STT Error:", error);
    return new Response("Failed to transcribe audio", { status: 500 });
  }
}
