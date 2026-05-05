import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contactType: z.enum(["Individual", "Business", "Company"]),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  interest: z.string().min(1, "Please select an area of interest"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  newsletterOptIn: z.boolean().default(false),
});

export const newsletterSubscriptionSchema = z.object({
  email: z.string().email("Invalid node identity (Email)"),
});
