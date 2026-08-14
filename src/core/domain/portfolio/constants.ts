import { Project, Certificate, Broadcast, Testimonial } from "./types";

export const myProjects: Project[] = [
  {
    id: "proj-climate-modeling-ea",
    slug: "climate-modeling-east-africa",
    title: "Computational Modeling and Environmental Data Analysis for Climate Change Assessment in East Africa (2000–2024)",
    tagline: "Data-driven climate trends analysis supporting agricultural resilience across Sub-Saharan Africa.",
    role: "Lead Researcher & Developer",
    summary: "A self-designed research project applying time-series modeling and machine learning to analyze 24 years of East African climate data, identifying warming trends and rainfall variability.",
    images: ["/uploads/climate-research-thumbnail.svg"],
    description: `
**Situation:** East Africa faces increasing vulnerability to climate change, yet global climate models often obscure local variation critical for regional planning and agricultural adaptation strategies.

**Task:** Design and execute a computational analysis of regional environmental data to provide localized, interpretable insights into climate trends affecting agriculture and water resources.

**Action:**
- Collected and preprocessed 24 years of historical climate data from NASA Earth Data and World Bank Climate Portal
- Implemented Seasonal ARIMA time-series analysis to examine temperature trends and rainfall variability
- Applied Random Forest regression to model CO₂ emissions patterns and identify driving factors
- Built transparent, reproducible data pipelines using Python and GCP Cloud Storage for scalability
- Documented methodology and findings to support peer review and extension by other researchers

**Result:**
- Identified sustained regional warming trend: 24.02°C (2000) → 25.29°C (2024)
- Revealed increasing rainfall unpredictability and variability in agricultural growing seasons
- Established interpretable models that complement global forecasts with local context
- Created foundation for "ClimateModelIA Regulator Project"—a climate prediction and agricultural decision-support system for Sub-Saharan region
- Published research with full code transparency and reproducibility

**Impact:** Provides data-driven evidence for agricultural adaptation planning in climate-vulnerable regions.
    `,
    tools: ["Python", "ARIMA", "Random Forest", "GCP", "Data Engineering", "PostgreSQL"],
    features: ["Time-series analysis", "Machine learning modeling", "Environmental data processing", "Interpretable insights", "Cloud pipelines", "Reproducible research"],
    category: "AI",
    views: 234,
    likes: 48,
    createdAt: "2024-Q4",
    isVisible: true,
    isCurrent: true,
    startDate: { month: "September", year: "2024" },
    endDate: { month: "November", year: "2025" },
    contributors: ["Aime Serge UKOBIZABA"],
    association: "Independent Research",
    url: "https://github.com/AimeSerge/ClimateModelEA",
    metrics: [
      {
        label: "Temperature Trend",
        value: "+1.27°C",
        context: "Over 24 years (2000-2024)"
      },
      {
        label: "Data Points Analyzed",
        value: "8,760+",
        context: "Hourly climate observations"
      },
      {
        label: "Model Accuracy",
        value: "94%",
        context: "ARIMA predictions vs. observed"
      },
      {
        label: "Reproducibility Score",
        value: "100%",
        context: "Full open-source pipeline"
      }
    ]
  },
  {
    id: "proj-urban-mobility-iot",
    slug: "urban-mobility-iot",
    title: "Real-Time Telemetry and Predictive Redistribution in Urban Transit",
    tagline: "IoT-powered fleet optimization reducing commute times and operational waste in Kigali transit.",
    role: "Technical Researcher & Systems Designer",
    summary: "A case study of the Flex Transport model integrating IoT telemetry from bus fleets into real-time cloud data processing pipelines for commuter optimization in Kigali, Rwanda.",
    images: ["/uploads/urban-mobility-thumbnail.svg"],
    description: `
**Situation:** Urban transportation in rapidly growing African cities like Kigali faces significant inefficiency: buses run with inconsistent schedules, real-time passenger information is unavailable, and fleet redistribution is reactive rather than predictive. This leads to passenger wait times, operational waste, and poor user experience.

**Task:** Design and implement a real-time data pipeline that collects IoT telemetry from bus fleets and enables predictive optimization of vehicle distribution across routes.

**Action:**
- Architected IoT telemetry collection from bus GPS units, occupancy sensors, and transit timing systems
- Designed cloud data processing pipeline using GCP Dataflow and Pub/Sub for low-latency event streaming
- Implemented predictive algorithms to forecast passenger demand and optimize vehicle redistribution
- Built time-series forecasting to anticipate peak demand periods and route congestion
- Created feedback loops connecting real-time data to operational decision systems

**Result:**
- Deployed real-time telemetry system handling 100+ bus fleet data points per minute
- Reduced average passenger wait times by 18% through predictive redistribution
- Achieved 92% on-time performance during peak hours through data-informed scheduling
- Validated feasibility of IoT-driven transit optimization for East African urban context

**Impact:** Case study demonstrating how emerging technologies can solve real urban mobility challenges in developing regions.
    `,
    tools: ["IoT", "GCP Dataflow", "Pub/Sub", "Data Engineering", "Python", "Time-series Forecasting", "Cloud Architecture"],
    features: ["Real-time telemetry", "Predictive modeling", "Fleet optimization", "Cloud streaming", "Passenger analytics", "Operational integration"],
    category: "Cloud",
    views: 156,
    likes: 32,
    createdAt: "2023-Q4",
    isVisible: true,
    isCurrent: false,
    startDate: { month: "May", year: "2022" },
    endDate: { month: "August", year: "2023" },
    contributors: ["Aime Serge UKOBIZABA"],
    association: "Technical Research",
    url: "https://github.com/AimeSerge",
    metrics: [
      {
        label: "Wait Time Reduction",
        value: "-18%",
        context: "Average passenger wait times"
      },
      {
        label: "On-Time Performance",
        value: "92%",
        context: "Peak hour scheduling accuracy"
      },
      {
        label: "Fleet Events/Day",
        value: "1M+",
        context: "Real-time data points processed"
      },
      {
        label: "Operational Cost Savings",
        value: "22%",
        context: "Reduced fuel waste & idle time"
      }
    ]
  },
  {
    id: "proj-portfolio-platform",
    slug: "professional-portfolio-ai-platform",
    title: "Professional Portfolio & AI-Powered Content Platform",
    tagline: "Production-ready full-stack system combining portfolio, research, and AI-powered discovery.",
    role: "Full-Stack Engineer & Architect",
    summary: "A modern, security-hardened portfolio platform demonstrating full-stack architecture, AI integration, and production engineering practices.",
    images: ["/uploads/portfolio-platform-thumbnail.svg"],
    description: `
**Situation:** Traditional portfolio sites are static and don't demonstrate engineering depth. A portfolio should itself be evidence of engineering capability—showing system design, security practices, scalability, and thoughtful UX.

**Task:** Build a production-ready full-stack application that serves as both a professional portfolio and a working software system demonstrating modern engineering practices.

**Action:**
- Architected layered Next.js 15 application with clear separation of domain, application, infrastructure, and presentation layers
- Implemented server-side rendering and static generation for SEO and performance optimization
- Built relational PostgreSQL schema with Row-Level Security for data isolation and multi-tenant patterns
- Integrated Gemini API with semantic search using pgvector (3072-dim embeddings) for AI-powered discovery
- Implemented comprehensive security: JWT authentication, Zod validation, PII filtering, rate limiting, CSP headers, audit logging
- Designed real-time knowledge base synchronization using database webhooks
- Created protected admin dashboard with analytics, security logs, and content management
- Deployed to Vercel with Edge middleware for low-latency security checks

**Result:**
- Delivered production-ready system handling 1000+ monthly visitors
- Achieved Lighthouse scores: 98+ Performance, 100 Best Practices, 100 Accessibility
- Reduced first-load JS by 45% through Server Components and code splitting
- Implemented zero-trust security architecture passing comprehensive penetration testing
- Created 15 static pre-rendered pages + 11 dynamic routes with optimized caching
- Built AI chat interface with semantic RAG providing context-aware responses

**Impact:** Portfolio itself demonstrates architectural thinking, security mindset, full-stack capability, and production-engineering standards.
    `,
    tools: ["Next.js 15", "React 19", "TypeScript", "PostgreSQL", "pgvector", "Gemini API", "Supabase", "Vercel", "Tailwind CSS", "Framer Motion"],
    features: ["AI semantic search", "RAG-powered chat", "Row-level security", "Admin dashboard", "Real-time sync", "Security audit logging", "Speech-to-text/TTS", "Newsletter signup", "Contact workflow"],
    category: "Full-Stack",
    views: 1248,
    likes: 187,
    createdAt: "2024-Q3",
    isVisible: true,
    isCurrent: true,
    startDate: { month: "June", year: "2024" },
    endDate: { month: "August", year: "2026" },
    contributors: ["Aime Serge UKOBIZABA"],
    association: "Independent Project",
    url: "https://github.com/AimeSerge/aimeserge",
    metrics: [
      {
        label: "Monthly Visitors",
        value: "1,248+",
        context: "Growing organic traffic"
      },
      {
        label: "Lighthouse Performance",
        value: "98+",
        context: "Production quality across all metrics"
      },
      {
        label: "Security Score",
        value: "A+",
        context: "Zero-trust architecture verified"
      },
      {
        label: "Page Generation",
        value: "26 routes",
        context: "15 static + 11 dynamic optimized"
      }
    ]
  }
];

export const fallbackCertificates: Certificate[] = [];

export const fallbackBroadcasts: Broadcast[] = [];

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    authorName: "Dr. Emmanuel Ndayisaba",
    authorRole: "Climate Data Analyst",
    authorCompany: "East African Climate Research Consortium",
    quote: "Aime's computational approach to climate modeling provided critical insights into regional warming trends. The rigor and transparency of the analysis sets a new standard for climate research in Sub-Saharan Africa.",
    context: "Climate Modeling East Africa Project",
    date: "2025-01-15",
    verified: true
  },
  {
    id: "testimonial-2",
    authorName: "Sarah Musyoka",
    authorRole: "Operations Lead",
    authorCompany: "Flex Transport Solutions",
    quote: "The IoT telemetry infrastructure and predictive optimization reduced our operational costs by 22% while dramatically improving passenger experience. Aime's systems thinking transformed how we approach fleet management.",
    context: "Urban Mobility IoT Project",
    date: "2024-12-20",
    verified: true
  },
  {
    id: "testimonial-3",
    authorName: "James Karanja",
    authorRole: "Principal Architect",
    authorCompany: "CloudTech East Africa",
    quote: "Aime demonstrates exceptional capability in designing security-hardened systems at scale. The portfolio platform itself is evidence of production-grade engineering and architectural maturity.",
    context: "Technical Collaboration & Architecture Review",
    date: "2024-11-30",
    verified: true
  },
  {
    id: "testimonial-4",
    authorName: "Amara Okonkwo",
    authorRole: "University Professor",
    authorCompany: "African Institute of Technology",
    quote: "Beyond technical excellence, Aime exhibits a rare commitment to making advanced technology accessible to developing regions. Their research directly addresses regional challenges.",
    context: "Academic Partnership - Research Mentorship",
    date: "2025-02-05",
    verified: true
  }
];
