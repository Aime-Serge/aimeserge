import { createClient } from '@supabase/supabase-js';
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

const myProjects = [
  {
    slug: "advanced-ecommerce-platform",
    title: "AI-Powered E-commerce Hub",
    tagline: "Secure, scalable commerce with Vertex AI personalization.",
    role: "Full-Stack Engineer",
    summary: "A high-performance storefront featuring Vertex AI Search for natural language discovery.",
    description: `
**Situation:** Traditional e-commerce search engines often fail to understand intent, leading to poor user conversion and discovery.
**Task:** Build a secure, scalable platform that integrates advanced AI search and handles high-concurrency transactions.
**Action:** Integrated Vertex AI Search to allow natural language queries. Implemented a Next.js frontend with Server Components for SEO and speed. Secured the backend using Google Cloud Model Armor and strict IAM protocols for data privacy.
**Result:** Delivered a production-ready prototype showing a significant improvement in search relevance and a hardened security posture for financial transactions.
    `,
    tools: ["Next.js", "TypeScript", "Vertex AI", "PostgreSQL", "Google Cloud IAM"],
    features: ["Semantic search integration", "Secure payment gateways", "Auto-scaling infrastructure", "Personalized recommendations"],
    category: "Full-Stack",
    views: 980,
    likes: 143,
    created_at: "2024-07-01T00:00:00Z"
  },
  {
    slug: "secure-rest-api-system",
    title: "Scalable REST API System",
    tagline: "Production-ready backend with zero-trust security.",
    role: "Backend Engineer",
    summary: "Designed a hardened API layer with JWT authentication and role-based access control.",
    description: `
**Situation:** Many startups struggle with backend systems that are vulnerable to injection and cannot scale horizontally under load.
**Task:** Develop a standardized, secure API scaffold that enforces strict validation and authorization.
**Action:** Built a Node.js/Django backend utilizing Zod for schema validation. Implemented JWT-based authentication with encrypted payloads and multi-tier rate limiting via Upstash/Redis.
**Result:** Established a reusable security-first architecture that prevents 99% of common OWASP Top 10 vulnerabilities while maintaining high throughput.
    `,
    tools: ["Node.js", "Django", "PostgreSQL", "Zod", "Upstash Redis"],
    features: ["JWT Auth", "RBAC", "Rate Limiting", "Pagination & Filtering", "Audit Logging"],
    category: "Security",
    views: 1560,
    likes: 226,
    created_at: "2024-04-01T00:00:00Z"
  }
];

async function pushProjects() {
  console.log(`🚀 Pushing ${myProjects.length} projects to Supabase...`);
  
  for (const project of myProjects) {
    // Remove the ID and let Supabase generate a valid UUID
    const { error } = await supabase
      .from('projects')
      .upsert(project, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Failed to push ${project.slug}:`, error.message);
    } else {
      console.log(`✅ Successfully pushed: ${project.title}`);
    }
  }

  // Ensure 'kigali-transport-model' is removed
  const { error: deleteError } = await supabase
    .from('projects')
    .delete()
    .eq('slug', 'kigali-transport-model');

  if (!deleteError) {
    console.log(`🗑️ Ensured 'kigali-transport-model' is removed from database.`);
  }

  console.log('✨ Project Sync Complete.');
}

pushProjects();
