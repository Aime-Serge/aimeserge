import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const apiKey = process.env.GEMINI_API_KEY;

async function testEmbedding2() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  const result = await model.embedContent("Hello world");
  console.log("gemini-embedding-2 length:", result.embedding.values.length);
}
testEmbedding2();
