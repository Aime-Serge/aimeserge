"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { type ContactSubmission } from "./types";
import { withShield } from "@/infrastructure/security/shield";
import { contactSubmissionSchema, newsletterSubscriptionSchema } from "./schemas";
import { notifyAdmin } from "@/infrastructure/utils/notifications";

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

    // Trigger Enhanced Notification Pipeline
    await notifyAdmin({
      title: "New Inquiry Received",
      message: `A new inquiry node has been synchronized from ${data.name}.`,
      type: 'INQUIRY',
      data: {
        Name: data.name,
        Email: data.email,
        Type: data.contactType,
        Interest: data.interest,
        Message: data.message.substring(0, 500) // Truncate for notification safety
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
          message: '[AUTOMATED_SUBSCRIPTION] Direct entry from technical feed.',
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
            message: '[SUBSCRIPTION_SYNC] This user is a technical feed subscriber.',
          }
        ]);
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
