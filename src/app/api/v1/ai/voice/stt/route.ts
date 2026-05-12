import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio");

    if (!(audioBlob instanceof Blob)) {
      return new Response("Audio blob is required", { status: 400 });
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const audioBuffer = await audioBlob.arrayBuffer();

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this audio exactly." },
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
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("STT Error:", error);
    return new Response("Failed to transcribe audio", { status: 500 });
  }
}
