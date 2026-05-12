import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Manual .env.local loader
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...value] = line.split('=');
      return [key.trim(), value.join('=').trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY || "");

const samples = [
  {
    slug: 'zero-trust-cloud-native',
    title: 'Architecting Zero-Trust Frameworks for Cloud-Native Distributed Systems',
    abstract: 'A deep-dive analysis into transitioning from perimeter-based security to granular, identity-centric verification. This research explores the implementation of mTLS, IAM-based authorization, and micro-segmentation to mitigate lateral movement risks in multi-cloud environments.',
    pdf_url: '/uploads/alx-project-0x05-setup_case_study.pdf',
    tags: ['Cybersecurity', 'Zero-Trust', 'Cloud-Native', 'IAM']
  },
  {
    slug: 'mitigating-cost-attacks',
    title: 'Mitigating Cost-Exhaustion Attacks in Serverless Cloud Architectures',
    abstract: 'Evaluation of proactive defense mechanisms against EDoS (Economic Denial of Sustainability) in Google Cloud and AWS environments. Features a technical breakdown of rate-limiting throttles and anomaly detection in egress traffic.',
    pdf_url: '/uploads/alx-project-0x03-setup_case_study.pdf',
    tags: ['GCP', 'AWS', 'Resilience', 'Cloud-Security']
  },
  {
    slug: 'rag-pipeline-optimization',
    title: 'Optimization of RAG Pipelines for Domain-Specific Technical Knowledge',
    abstract: 'Technical exploration of vector embedding strategies and prompt-engineering patterns. This paper assesses the impact of "System-Prompt Hardening" on the reliability and professional tone of AI-driven Digital Twins.',
    pdf_url: '/uploads/alx-graphql-0x03_case_study.pdf',
    tags: ['AI', 'RAG', 'LLM', 'Responsible-AI']
  },
  {
    slug: 'urban-mobility-iot',
    title: 'Real-Time Telemetry and Predictive Redistribution in Urban Transit',
    abstract: 'A technical case study of the "Flex" Transport model in Kigali, Rwanda. Analyzes the integration of IoT telemetry from bus fleets into real-time cloud data processing pipelines for commuter optimization.',
    pdf_url: '/uploads/prodev-mobile-app_case_study.pdf',
    tags: ['IoT', 'Telemetry', 'Data-Engineering', 'Rwanda']
  }
];

async function seedResearch() {
  console.log('🚀 Seeding Technical Research Node...');

  for (const sample of samples) {
    // 1. Insert into research table
    const { data, error } = await supabase
      .from('research')
      .upsert(sample, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to seed ${sample.slug}:`, error.message);
      continue;
    }

    // 2. Generate and Sync Knowledge Base (RAG)
    const contentToEmbed = `Research Topic: ${data.title}\nAbstract: ${data.abstract}\nTags: ${data.tags.join(', ')}`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(contentToEmbed);
    const embedding = result.embedding.values;

    await supabase.from('knowledge').upsert({
      id: data.id,
      content: contentToEmbed,
      embedding: embedding,
      metadata: { type: 'research', slug: data.slug, title: data.title }
    });

    console.log(`✅ Seeded & Vectorized: ${data.slug}`);
  }

  console.log('✨ Research Node Seeding Complete.');
}

seedResearch();
