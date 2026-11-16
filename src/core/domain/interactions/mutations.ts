"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { type ContactSubmission } from "./types";
import { withShield } from "@/infrastructure/security/shield";
import { contactSubmissionSchema, newsletterSubscriptionSchema } from "./schemas";
import { sendInquiryEmails } from "@/infrastructure/utils/notifications";
import { SITE } from "@/config/site";

async function submitContactFormBase(formData: ContactSubmission) {
  // Validate input
  const validatedFields = contactSubmissionSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0]?.message || "Please check the form and try again." };
  }

  // Honeypot filled in: almost certainly a bot. Pretend success, store nothing.
  if (validatedFields.data.website) {
    return { success: true, message: "Thanks! Your message has been sent." };
  }

  const data = validatedFields.data;

  // 1. Save to the database (Admin → Messages). A failure here must not lose the message.
  let saved = false;
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from("contacts").insert([{
      name: data.name,
      email: data.email,
      contact_type: data.contactType,
      company_name: data.companyName,
      job_title: data.jobTitle,
      interest: data.interest,
      budget: data.budget,
      timeline: data.timeline,
      location: data.location,
      linkedin_url: data.linkedinUrl,
      whatsapp: data.whatsapp,
      message: data.message,
      newsletter_opt_in: data.newsletterOptIn,
    }]);
    if (error) console.error("Contact not saved to the database:", error.message);
    else saved = true;
  } catch (err) {
    console.error("Contact not saved to the database:", err instanceof Error ? err.message : err);
  }

  // 2. Email it to the owner (and confirm to the visitor), whether or not it was saved.
  let emailed = false;
  try {
    emailed = (await sendInquiryEmails(data, saved)).ownerEmailed;
  } catch (err) {
    console.error("Contact email failed:", err instanceof Error ? err.message : err);
  }

  // The message is safe if at least one copy exists.
  if (saved || emailed) {
    return { success: true, message: `Thanks! Your message has been sent. ${SITE.responseTime}` };
  }
  return { success: false, message: `Sorry, your message couldn't be sent. Please email me at ${SITE.email}.` };
}

// At most 3 messages per minute per visitor: each one sends emails.
export const submitContactForm = withShield("contact_submission", submitContactFormBase, { limit: 3 });

/**
 * High-speed Newsletter Subscription
 */
async function subscribeNewsletterBase(email: string) {
  const validatedFields = newsletterSubscriptionSchema.safeParse({ email });
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const supabase = createServerSupabaseClient();
  const validatedEmail = validatedFields.data.email;

  try {
    const { error } = await supabase
      .from('contacts')
      .insert([
        {
          name: 'Subscriber',
          email: validatedEmail,
          contact_type: 'Individual',
          interest: 'Other',
          message: '[NEWSLETTER] Subscribed from the website.',
          newsletter_opt_in: true, 
        }
      ]);

    if (error && error.message.includes('newsletter_opt_in')) {
       await supabase
        .from('contacts')
        .insert([
          {
            name: 'Subscriber',
            email: validatedEmail,
            contact_type: 'Individual',
            interest: 'Other',
            message: '[NEWSLETTER] Subscribed from the website.',
          }
        ]);
       return { success: true, message: "You're subscribed. Thanks!" };
    }

    if (error) {
      if (error.code === '23505') return { success: true, message: "You're already subscribed." };
      throw error;
    }

    return { success: true, message: "You're subscribed. Thanks!" };
  } catch (err) {
    console.error("Newsletter Error:", err);
    return { success: false, message: "Subscription failed. Please try again later." };
  }
}

export const subscribeNewsletter = withShield("newsletter_subscription", subscribeNewsletterBase);
