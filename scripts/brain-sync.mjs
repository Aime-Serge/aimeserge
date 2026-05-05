import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

/**
 * .env.local loader
 */
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

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * STATIC_CONTENT_MAP: Hardcoded copy from the website's .tsx files.
 * This ensures the AI "knows" what's on the pages you see.
 */
const STATIC_PAGES = [
  {
    id: 'page-home-hero',
    content: `Aime Serge UKOBIZABA: Software Engineer, Cybersecurity Analyst, Aspiring AI Engineer, Google Cloud Certified, ALX Ventures Rwanda Ambassador. Motto: Building Secure, Scalable & AI-Powered Infrastructure. Engineering Focus: Designing high-performance backend systems and secure APIs for startups.`,
    metadata: { type: 'static', path: '/', section: 'hero' }
  },
  {
    id: 'page-home-approach',
    content: `Engineering Approach: 
1. Security-First: Encryption at rest and in transit, hardened IAM. 
2. Cloud-Native Scale: Serverless & containerized architectures. 
3. AI Integration: Leveraging RAG and LLMs to automate workflows. 
4. Software Craftsmanship: DS&A, Clean Code, System Design patterns.`,
    metadata: { type: 'static', path: '/', section: 'approach' }
  },
  {
    id: 'page-resume-experience',
    content: `Work Experience: 
- Software Engineer at ALX Rwanda / ALX Ventures Rwanda Ambassador (2026-Present): Building secure backends for startups, Next.js full-stack development, AI agent integration.
- Technical Researcher (2022-2023): IoT solutions for urban mobility (Flex Transport Model), AI ethics researcher.`,
    metadata: { type: 'static', path: '/resume', section: 'experience' }
  },
  {
    id: 'page-resume-education',
    content: `Education & Credentials:
- ALX Software Engineering Program (2023-2024): Foundations, Backend, and AI tracks.
- BSc Computer Science, University of Rwanda (In Progress).
- Google Cloud Certified: 22+ Badges including Vertex AI and Model Armor.`,
    metadata: { type: 'static', path: '/resume', section: 'education' }
  },
  {
    id: 'page-contact-info',
    content: `Contact & Communication:
- Official Email: aimeserge51260@gmail.com
- Response Latency: 24-48 hours (GMT+2)
- Channels: LinkedIn, GitHub, ORCID, Email.`,
    metadata: { type: 'static', path: '/contact', section: 'info' }
  }
];

async function syncOmniscience() {
  console.log('🧠 INITIATING OMNISCIENCE CORE SYNC...');

  const knowledgeItems = [...STATIC_PAGES];

  // 1. Fetch Projects from DB
  console.log('📡 Syncing Database: Projects...');
  const { data: projects } = await supabase.from('projects').select('*');
  if (projects) {
    projects.forEach(p => {
      knowledgeItems.push({
        id: `project-${p.slug}`,
        content: `PROJECT: ${p.title}\nRole: ${p.role}\nSummary: ${p.summary}\nTools: ${p.tools.join(', ')}\nDetails: ${p.description}`,
        metadata: { type: 'project', slug: p.slug, title: p.title }
      });
    });
  }

  // 2. Fetch Research from DB
  console.log('📡 Syncing Database: Research...');
  const { data: research } = await supabase.from('research').select('*');
  if (research) {
    research.forEach(r => {
      knowledgeItems.push({
        id: `research-${r.slug}`,
        content: `RESEARCH: ${r.title}\nAbstract: ${r.abstract}\nTags: ${r.tags.join(', ')}`,
        metadata: { type: 'research', slug: r.slug, title: r.title }
      });
    });
  }

  // 3. Grounding LinkedIn & Ethics
  knowledgeItems.push({
    id: 'profile-master',
    content: `Full Profile of Aime Serge UKOBIZABA: Senior Software Engineer, Google Cloud Expert, and AI Researcher. Specializes in Zero-Trust Security, RAG systems, and Scalable Backend architecture. ALX Alumni. LinkedIn verified expertise in Python, Node.js, and GCP. Latest: Appointed ALX Ventures Rwanda Ambassador (May 2026).`,
    metadata: { type: 'profile', source: 'linkedin' }
  });

  // 4. Fetch GitHub Repositories
  console.log('📡 Syncing External: GitHub...');
  try {
    const ghResponse = await fetch('https://api.github.com/users/AimeSerge/repos?sort=updated&per_page=5');
    if (ghResponse.ok) {
      const repos = await ghResponse.json();
      repos.forEach(repo => {
        knowledgeItems.push({
          id: `github-repo-${repo.name}`,
          content: `GITHUB REPO: ${repo.name}\nDescription: ${repo.description}\nURL: ${repo.html_url}\nStars: ${repo.stargazers_count}\nLanguage: ${repo.language}`,
          metadata: { type: 'github', title: repo.name, url: repo.html_url }
        });
      });
    }
  } catch (e) {
    console.error('❌ GitHub Fetch Failed:', e.message);
  }

  // 5. Vectorize and Upsert
  for (const item of knowledgeItems) {
    console.log(`🧠 Indexing: ${item.id}...`);
    try {
      const embedding = await generateEmbedding(item.content);
      const { error } = await supabase
        .from('knowledge')
        .upsert({
          id: item.id,
          content: item.content,
          embedding: embedding,
          metadata: item.metadata
        });

      if (error) console.error(`❌ Indexing Error [${item.id}]:`, error.message);
      else console.log(`✅ ${item.id} Synced.`);
    } catch (e) {
      console.error(`❌ Vectorization Failed [${item.id}]:`, e.message);
    }
  }

  console.log('✨ OMNISCIENCE SYNC COMPLETE. The AI is now synchronized with all website layers.');
}

syncOmniscience();
