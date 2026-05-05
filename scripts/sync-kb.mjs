import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Since we are in MJS and can't easily import TS files without a build step,
// we'll extract the raw data from knowledgeBase.ts or just provide a simplified sync logic.
// For this portfolio, we'll implement a logic that can be run to sync the core profile.

const KNOWLEDGE_BASE_ITEMS = [
  {
    id: 'about-aime',
    type: 'about',
    content: `Aime Serge UKOBIZABA is a Senior Software Engineer specializing in Cybersecurity, Cloud Engineering, and AI Architectures. ALX Software Engineering Alumni with a BSc in Computer Science from the University of Rwanda. Google Cloud Certified with 22+ badges including Vertex AI, MLOps, and Model Armor. Official Email: aimeserge51260@gmail.com. GitHub: https://github.com/AimeSerge`,
    metadata: { type: 'profile', title: 'About Aime Serge' }
  },
  {
    id: 'official-platforms',
    type: 'links',
    content: `Official professional platforms for Aime Serge UKOBIZABA:
- GitHub Repository: https://github.com/AimeSerge
- Academic ORCID: https://orcid.org/0009-0004-1804-9548
- Contact Email: aimeserge51260@gmail.com
- Portfolio Website: Official Node hosted on Vercel.`,
    metadata: { type: 'links', title: 'Official Platforms' }
  },
  {
    id: 'tech-skills',
    type: 'skill',
    content: `Backend: Node.js, Python (Django/DRF), Go, TypeScript, PostgreSQL, Redis. Cloud: Google Cloud Platform (GCP) - expert, AWS, Vercel. AI/ML: RAG pipelines, LLM prompt design, Vertex AI, Semantic search. Security: Zero-Trust Architecture, IAM, API Hardening, OWASP Top 10 mitigation, Penetration testing. DevOps: Docker, Kubernetes, CI/CD pipelines, Infrastructure-as-code.`,
    metadata: { type: 'skills', title: 'Technical Stack' }
  },
  {
    id: 'security-expertise',
    type: 'experience',
    content: `Expertise in implementing Zero-Trust Architecture, Identity & Access Management (IAM), API security hardening, and comprehensive OWASP Top 10 vulnerability mitigation. Conducted penetration testing and security audits on multiple production systems.`,
    metadata: { type: 'security', title: 'Cybersecurity Specialization' }
  }
];

async function sync() {
  console.log('🚀 Starting Knowledge Base Synchronization...');

  for (const item of KNOWLEDGE_BASE_ITEMS) {
    console.log(`📡 Syncing: ${item.id}...`);
    const embedding = await generateEmbedding(item.content);
    
    const { error } = await supabase
      .from('knowledge')
      .upsert({
        id: item.id,
        content: item.content,
        embedding: embedding,
        metadata: item.metadata
      });

    if (error) {
      console.error(`❌ Error syncing ${item.id}:`, error);
    } else {
      console.log(`✅ Synced ${item.id}`);
    }
  }

  console.log('✨ Synchronization complete.');
}

sync().catch(console.error);
