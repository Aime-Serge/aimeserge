import { z } from "zod";

export const researchAuthorSchema = z.object({
  name: z.string(),
  orcid: z.string().optional(),
  affiliation: z.string().optional(),
});

export const researchSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export const researchAssetSchema = z.object({
  url: z.string().url(),
  caption: z.string(),
  type: z.enum(['image', 'video', 'csv', 'raw_data']),
  anchor_id: z.string(),
});

export const researchPaperSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string().min(5),
  abstract: z.string().min(20),
  pdfUrl: z.string().url(),
  tags: z.array(z.string()),
  views: z.number().int().nonnegative().default(0),
  downloads: z.number().int().nonnegative().default(0),
  createdAt: z.string(),

  // Professional Layers
  doi: z.string().optional(),
  authors: z.array(researchAuthorSchema).default([]),
  funding: z.string().optional(),
  publicationDate: z.string(),
  content: z.array(researchSectionSchema).default([]),
  assets: z.array(researchAssetSchema).default([]),
  category: z.string().optional(),
  language: z.string().default('en'),
  citations: z.number().int().nonnegative().default(0),
});

export type ResearchPaperSchema = z.infer<typeof researchPaperSchema>;
