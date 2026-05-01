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
}

export const fallbackResearch: ResearchPaper[] = [];
