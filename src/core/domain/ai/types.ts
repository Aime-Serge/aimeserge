export interface KnowledgeMetadata {
  type?: string;
  slug?: string;
  title?: string;
  [key: string]: unknown;
}

export interface KnowledgeMatch {
  content: string;
  metadata?: KnowledgeMetadata | null;
}
