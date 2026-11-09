import { z } from "zod";

// Every field has a max length so one request can't store megabytes of text.
const optionalText = (max: number) => z.string().trim().max(max).optional();

export { CONTACT_INTERESTS } from "./types";

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  contactType: z.enum(["Individual", "Business", "Company"]),
  companyName: optionalText(150),
  jobTitle: optionalText(150),
  interest: z.string().trim().min(1, "Please choose a topic.").max(50),
  budget: optionalText(50),
  timeline: optionalText(50),
  location: optionalText(100),
  linkedinUrl: z.string().trim().url("Please enter a full LinkedIn URL.").max(300).optional().or(z.literal("")),
  whatsapp: optionalText(30),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(5000, "Please keep your message under 5,000 characters."),
  newsletterOptIn: z.boolean().default(false),
  website: z.string().optional(),
});

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(200),
});
