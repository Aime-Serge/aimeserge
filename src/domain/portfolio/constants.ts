import { Project, Certificate, Broadcast } from "./types";

export const myProjects: Project[] = [
  {
    id: "proj-transport-kigali",
    slug: "kigali-transport-model",
    title: "Kigali Transport Optimization (Flex)",
    tagline: "IoT & AI-driven logistics for urban mobility in Rwanda.",
    role: "Lead Systems Architect",
    summary: "Solving unreliable scheduling in Kigali through real-time tracking and predictive AI.",
    description: `
**Situation:** Public transport in Kigali faced significant challenges with unreliable scheduling and inefficient fleet distribution, leading to long wait times and congested hubs.
**Task:** Design a scalable digital infrastructure to track bus movements in real-time and predict peak demand to optimize fleet allocation.
**Action:** Leveraged Google Cloud's real-time data processing to ingest IoT telemetry from bus fleets. Implemented Vertex AI models to analyze historical traffic patterns and redistribution logic. Developed a mobile-first interface for commuters to access live ETAs.
**Result:** Created a blueprint for a "Smart City" mobility node capable of reducing commuter wait times and providing data-driven insights for transport regulators.
    `,
    tools: ["Google Cloud", "Vertex AI", "IoT Sensors", "Node.js", "Ubuntu"],
    features: ["Real-time GPS tracking", "Predictive fleet redistribution", "User-facing mobile app", "Regulator Dashboard"],
    category: "AI",
    views: 1240,
    likes: 188,
    createdAt: "2024-Q4"
  },
  {
    id: "proj-ecommerce-ai",
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
    createdAt: "2024-Q3"
  },
  {
    id: "proj-secure-api",
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
    createdAt: "2024-Q2"
  }
];

export const fallbackCertificates: Certificate[] = [];

export const fallbackBroadcasts: Broadcast[] = [];
