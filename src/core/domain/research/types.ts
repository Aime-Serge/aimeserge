export interface ResearchAuthor {
  name: string;
  orcid?: string;
  affiliation?: string;
}

export interface ResearchSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ResearchAsset {
  url: string;
  caption: string;
  type: 'image' | 'video' | 'csv' | 'raw_data';
  anchor_id: string;
}

export interface ResearchPaper {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  pdfUrl: string;
  tags: string[];
  views: number;
  downloads: number;
  createdAt: string;

  // Professional Layers
  doi?: string;
  authors: ResearchAuthor[];
  funding?: string;
  publicationDate: string;
  content: ResearchSection[];
  assets: ResearchAsset[];
  category?: string;
  language: string;
  citations: number;
  /** Where the work stands. Missing means published (older rows). */
  status?: ResearchStatus;
}

export type ResearchStatus = "in_progress" | "under_review" | "preprint" | "published";

export const RESEARCH_STATUS_LABEL: Record<ResearchStatus, string> = {
  in_progress: "In progress, not yet peer reviewed",
  under_review: "Under peer review",
  preprint: "Preprint, not yet peer reviewed",
  published: "Published",
};

export { fallbackResearch } from "./fallbackResearch";
