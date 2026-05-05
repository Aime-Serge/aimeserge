export interface Project {
  id: string;
  slug: string;
  title: string; // LinkedIn: Project name
  tagline: string;
  role: string;
  url?: string; // LinkedIn: Media (Site)
  pdfUrl?: string; // LinkedIn: Media (Document)
  videoUrl?: string; // LinkedIn: Media (Video/Presentation)
  images?: string[]; // LinkedIn: Media (Images)
  summary: string;
  description: string; // LinkedIn: Description (Max 2000)
  tools: string[]; // LinkedIn: Skills
  features: string[];
  category: "AI" | "Security" | "Cloud" | "Full-Stack" | "Software Engineering";
  views?: number;
  likes?: number;
  createdAt: string;
  isVisible?: boolean;
  
  // LinkedIn Specific Fields
  isCurrent?: boolean; // "I am currently working on this project"
  startDate?: {
    month: string;
    year: string;
  };
  endDate?: {
    month: string;
    year: string;
  };
  contributors?: string[]; // LinkedIn: Contributors
  association?: string; // LinkedIn: Associated with (e.g. University, Company)
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

export type MediaType = 'NONE' | 'IMAGE' | 'IMAGE_CAROUSEL' | 'VIDEO' | 'DOCUMENT' | 'EXTERNAL_LINK';
export type Visibility = 'ANYONE' | 'CONNECTIONS_ONLY' | 'GROUP_ONLY';
export type CommentPermission = 'ANYONE' | 'CONNECTIONS_ONLY' | 'NO_ONE';

export interface Entity {
  type: 'USER' | 'COMPANY' | 'HASHTAG';
  id: string;
  offset: number;
  length: number;
}

export interface MediaPayload {
  url?: string;
  title?: string;
  pageCount?: number;
  thumbnailUrls?: string[];
  images?: string[];
  videoUrl?: string;
  ogTitle?: string;
  ogImage?: string;
  ogDescription?: string;
}

export type ContentType = 'POST' | 'ARTICLE';
export type PublicationStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'code' | 'callout' | 'list';
  data: {
    text?: string;
    level?: number;
    url?: string;
    caption?: string;
    altText?: string;
    language?: string;
    code?: string;
    type?: 'info' | 'warning' | 'success';
    items?: string[];
  };
}

export interface Broadcast {
  id: string;
  contentType: ContentType;
  status: PublicationStatus;
  slug: string;
  title: string;
  
  // Blog / Frontend Specific (Simplified)
  content?: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  readTime?: string;
  images?: string[];
  videoUrl?: string;
  
  // LinkedIn / Domain Specific (Complex)
  textContent?: string; 
  mediaType?: MediaType;
  mediaPayload?: MediaPayload;
  bodyBlocks?: ContentBlock[];
  coverImageUrl?: string;
  coverImageAlt?: string;
  estimatedReadTime?: number;
  
  // Shared
  isEdited: boolean;
  entities: Entity[];
  hashtags: string[];
  visibilityRestricted: Visibility;
  commentPermissions: CommentPermission;
  createdAt: string;
  updatedAt?: string;
  engagement?: {
    views: number;
    shares: number;
    likes: number;
  };
}
