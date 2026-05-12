import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();
  const embeddings = data.models.filter(m => m.supportedGenerationMethods.includes('embedContent'));
  console.log("Embeddings:", embeddings.map(m => m.name));
  
  const generators = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
  console.log("Generators:", generators.map(m => m.name));
}
listModels();
