"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { type ContactSubmission } from "./types";
import { withShield } from "@/infrastructure/security/shield";
import { contactSubmissionSchema, newsletterSubscriptionSchema } from "./schemas";
import { notifyAdmin } from "@/infrastructure/utils/notifications";
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

  const supabase = createServerSupabaseClient();
  const data = validatedFields.data;

  try {
    const { error } = await supabase
      .from('contacts')
      .insert([
        {
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
        }
      ]);

    if (error) {
      console.error("Supabase submission error:", error);
      return { success: false, message: `Your message couldn't be sent. Please email me at ${SITE.email}.` };
    }

    // Trigger Enhanced Notification Pipeline
    await notifyAdmin({
      title: "New Inquiry Received",
      message: `New message from ${data.name}.`,
      type: 'INQUIRY',
      data: {
        Name: data.name,
        Email: data.email,
        Type: data.contactType,
        Interest: data.interest,
        Message: data.message.substring(0, 500) // Truncate for notification safety
      }
    });

    return { success: true, message: "Thanks! Your message has been sent. I'll reply within 1–2 working days." };
  } catch (err) {
    console.error("Fatal contact submission error:", err);
    return { success: false, message: `Your message couldn't be sent. Please email me at ${SITE.email}.` };
  }
}

export const submitContactForm = withShield("contact_submission", submitContactFormBase);

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
