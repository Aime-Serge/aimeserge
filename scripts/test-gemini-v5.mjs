import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testV1() {
  if (!apiKey) return;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "hi" }] }]
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log("✅ v1 gemini-1.5-flash works!");
    } else {
      console.log("❌ v1 gemini-1.5-flash failed:", data.error?.message);
    }
  } catch (err) {
    console.log("❌ v1 request failed:", err.message);
  }
}

testV1();
