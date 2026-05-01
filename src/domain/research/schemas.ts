import { z } from "zod";

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
});

export type ResearchPaperSchema = z.infer<typeof researchPaperSchema>;
