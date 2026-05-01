"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { type ContactSubmission } from "./types";
import { withShield } from "@/infrastructure/security/shield";
import { notifyAdmin } from "@/infrastructure/utils/notifications";
import { contactSubmissionSchema, newsletterSubscriptionSchema } from "./schemas";

async function submitContactFormBase(formData: ContactSubmission) {
  // Validate input
  const validatedFields = contactSubmissionSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid data: " + validatedFields.error.message };
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
          gender: data.gender,
          marital_status: data.maritalStatus,
          message: data.message,
          newsletter_opt_in: data.newsletterOptIn,
        }
      ]);

    if (error) {
      console.error("Supabase submission error:", error);
      return { success: false, message: `System failure: ${error.message} [Ref: TRANSMISSION_ERR]` };
    }

    // Trigger Admin Notification
    await notifyAdmin({
      title: "New Inquiry Received",
      message: `A new ${data.interest} inquiry from ${data.name}`,
      type: 'INQUIRY',
      data: {
        Email: data.email,
        Interest: data.interest,
        Location: data.location
      }
    });

    return { success: true, message: "Inquiry successfully logged in the secure vault." };
  } catch (err) {
    console.error("Fatal contact submission error:", err);
    return { success: false, message: "Encryption failure during handshake." };
  }
}

export const submitContactForm = withShield("contact_submission", submitContactFormBase);

/**
 * High-speed Newsletter Subscription
 * Handles email capture for the technical feed.
 */
async function subscribeNewsletterBase(email: string) {
  // Validate input
  const validatedFields = newsletterSubscriptionSchema.safeParse({ email });
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const supabase = createServerSupabaseClient();
  const validatedEmail = validatedFields.data.email;

  try {
    // Try a resilient insert first (resort to message if newsletter_opt_in is missing)
    const { error } = await supabase
      .from('contacts')
      .insert([
        {
          name: 'Subscriber',
          email: validatedEmail,
          contact_type: 'Individual',
          interest: 'Other',
          message: '[AUTOMATED_SUBSCRIPTION] Direct entry from technical feed.',
          newsletter_opt_in: true, 
        }
      ]);

    // Handle the specific PGRST204 error (missing column)
    if (error && error.message.includes('newsletter_opt_in')) {
       console.warn("⚠️ DATABASE_SCHEMA_MISMATCH: Missing 'newsletter_opt_in' column. Retrying with fallback...");
       
       const { error: retryError } = await supabase
        .from('contacts')
        .insert([
          {
            name: 'Subscriber',
            email: validatedEmail,
            contact_type: 'Individual',
            interest: 'Other',
            message: '[SUBSCRIPTION_SYNC] This user is a technical feed subscriber.',
          }
        ]);
        
       if (retryError) throw retryError;
       return { success: true, message: "Connection established (Fallback node synced)." };
    }

    if (error) {
      if (error.code === '23505') return { success: true, message: "Node already synchronized." };
      throw error;
    }

    return { success: true, message: "Connection established. Node synced." };
  } catch (err) {
    console.error("Newsletter Error:", err);
    return { success: false, message: "Transmission failed. Secure node handshake timeout." };
  }
}

export const subscribeNewsletter = withShield("newsletter_subscription", subscribeNewsletterBase);
