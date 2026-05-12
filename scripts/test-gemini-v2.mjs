import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testEmbedding() {
  if (!apiKey) {
    console.error("❌ No API key found.");
    return;
  }
  
  // Test with gemini-embedding-001 which is standard
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent("Hello world");
    console.log("✅ gemini-embedding-001 works! Embedding length:", result.embedding.values.length);
  } catch (err) {
    console.error("❌ gemini-embedding-001 failed:", err.message);
  }

  // Test with text-embedding-004
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent("Hello world");
    console.log("✅ text-embedding-004 works! Embedding length:", result.embedding.values.length);
  } catch (err) {
    console.error("❌ text-embedding-004 failed:", err.message);
  }
}

testEmbedding();
