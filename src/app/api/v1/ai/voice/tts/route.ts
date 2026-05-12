export const runtime = "edge";

export async function POST(req: Request) {
  return new Response("TTS is now handled client-side via Web Speech API to comply with Gemini-only policy.", { status: 410 });
}
