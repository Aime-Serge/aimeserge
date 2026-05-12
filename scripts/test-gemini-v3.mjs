import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testGeneration() {
  if (!apiKey) {
    console.error("❌ No API key found.");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hi");
    console.log("✅ gemini-1.5-flash works! Response:", result.response.text());
  } catch (err) {
    console.error("❌ gemini-1.5-flash failed:", err.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent("Say hi");
    console.log("✅ gemini-1.5-pro works! Response:", result.response.text());
  } catch (err) {
    console.error("❌ gemini-1.5-pro failed:", err.message);
  }
}

testGeneration();
