export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | 'VOLUNTEER';
export type LocationType = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export interface Experience {
  id: string;
  title: string;
  employmentType: EmploymentType;
  location?: string;
  locationType: LocationType;
  startDate: string;
  endDate?: string; // Null if current
  description: string;
  skillsUsed: string[];
  companyId: string;
  company?: Organization;
}

export interface Education {
  id: string;
  institutionId: string;
  institution?: Organization;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  activities?: string;
  description?: string;
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
  issuerId?: string;
  issuer?: Organization;
  credentialId?: string;
}

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
  description: string; 
  tools: string[]; 
  features: string[];
  category: "AI" | "Security" | "Cloud" | "Full-Stack" | "Software Engineering";
  views?: number;
  likes?: number;
  createdAt: string;
  isVisible?: boolean;

  // LinkedIn / Professional Specific Fields
  startDate?: { month: string; year: string };
  endDate?: { month: string; year: string };
  isCurrent?: boolean;
  contributors?: string[];
  association?: string;

  // Case Study & Impact Fields
  metrics?: Array<{
    label: string;
    value: string;
    context?: string;
  }>;
}

export type MediaType = 'NONE' | 'IMAGE' | 'IMAGE_CAROUSEL' | 'VIDEO' | 'DOCUMENT' | 'EXTERNAL_LINK' | 'ARTICLE_PREVIEW';
export type Visibility = 'ANYONE' | 'CONNECTIONS_ONLY' | 'GROUP_ONLY';
export type CommentPermission = 'ANYONE' | 'CONNECTIONS_ONLY' | 'NO_ONE';
export type PublicationStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

export interface MediaPayload {
  url?: string;
  title?: string;
  images?: string[];
  videoUrl?: string;
  ogTitle?: string;
  ogImage?: string;
  ogDescription?: string;
}

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

export interface Article {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  excerpt?: string;
  bodyContent: ContentBlock[];
  estimatedReadTime: number;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  textContent: string;
  mediaType: MediaType;
  mediaPayload: MediaPayload;
  articleId?: string;
  article?: Article;
  engagement: {
    views: number;
    shares: number;
    likes: number;
  };
  createdAt: string;
  hashtags: string[];
}

export interface Broadcast {
  id: string;
  slug: string;
  title: string;
  contentType?: 'POST' | 'ARTICLE';
  content_type?: 'POST' | 'ARTICLE';
  textContent?: string;
  text_content?: string;
  excerpt?: string;
  estimatedReadTime?: number;
  bodyBlocks?: ContentBlock[];
  coverImageUrl?: string;
  coverImageAlt?: string;
  mediaType?: MediaType;
  media_type?: MediaType;
  mediaPayload?: MediaPayload;
  media_payload?: MediaPayload;
  visibility?: Visibility;
  commentPermission?: CommentPermission;
  engagement?: {
    views: number;
    shares: number;
    likes: number;
    comments: number;
  };
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  status?: PublicationStatus;
  hashtags: string[];
  category?: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  authorImage?: string;
  quote: string;
  context: string; // e.g., "Climate Modeling Project", "Technical Review"
  date: string;
  verified: boolean;
}

// Content Syndication Types
export type SyndicationPlatform = 'MEDIUM' | 'DEV_TO' | 'LINKEDIN' | 'HASHNODE' | 'SUBSTACK' | 'PERSONAL_BLOG';

export interface ContentSyndication {
  id: string;
  sourceContentId: string; // Post or Article ID
  sourceContentType: 'POST' | 'ARTICLE' | 'PROJECT' | 'RESEARCH';
  platform: SyndicationPlatform;
  externalUrl?: string; // URL on the syndication platform
  externalId?: string; // ID on the syndication platform
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  publishedAt?: string;
  syncedAt?: string;
  metrics?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyndicationConfig {
  platform: SyndicationPlatform;
  enabled: boolean;
  apiKey?: string;
  username?: string;
  customizations?: {
    appendCanonicalUrl?: boolean; // Add canonical link back to original
    appendAuthorBio?: boolean; // Add author bio at end
    appendCTA?: boolean; // Add call-to-action
  };
}
