import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testOldModels() {
  if (!apiKey) return;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const models = ["gemini-pro", "gemini-1.0-pro"];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say hi");
      console.log(`✅ ${m} works!`);
    } catch (err) {
      console.log(`❌ ${m} failed: ${err.message}`);
    }
  }
}

testOldModels();
