import { z } from "zod";

export const broadcastSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  content: z.string().min(20),
  excerpt: z.string().min(10),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  readTime: z.string().optional(),
});

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  role: z.string(),
  summary: z.string(),
  description: z.string(),
  tools: z.array(z.string()),
  features: z.array(z.string()),
  category: z.enum(["AI", "Security", "Cloud", "Full-Stack"]),
});
