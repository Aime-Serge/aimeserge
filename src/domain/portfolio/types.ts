export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  role: string;
  url?: string;
  pdfUrl?: string;
  videoUrl?: string;
  images?: string[];
  summary: string;
  description: string; // Detailed STAR breakdown
  tools: string[];
  features: string[];
  category: "AI" | "Security" | "Cloud" | "Full-Stack";
  views?: number;
  likes?: number;
  createdAt: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  role?: string;
  url?: string;
  summary: string;
  tools: string[];
  features: string[];
  pdfUrl: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  name: string;
  provider: string;
  issueDate: string;
  expiryDate?: string;
  verifyUrl?: string;
  pdfUrl?: string;
  description: string;
}

export interface Broadcast {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  createdAt: string;
  readTime: string;
  images?: string[];
  videoUrl?: string;
  engagement?: {
    views: number;
    shares: number;
  };
}
