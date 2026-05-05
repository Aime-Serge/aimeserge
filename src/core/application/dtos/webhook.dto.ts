import { z } from 'zod';

export const DatabaseWebhookSchema = z.object({
  table: z.string(),
  type: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  record: z.record(z.string(), z.any()).nullable(),
  old_record: z.record(z.string(), z.any()).nullable().optional(),
});

export type DatabaseWebhookDTO = z.infer<typeof DatabaseWebhookSchema>;
