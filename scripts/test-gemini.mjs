import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function listModels() {
  if (!apiKey) {
    console.error("❌ No API key found.");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const result = await genAI.listModels();
    console.log("✅ Available Models:");
    result.models.forEach(m => {
      console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (err) {
    console.error("❌ Failed to list models:", err);
  }
}

listModels();
