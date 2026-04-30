"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type ContactSubmission } from "./contact-types";
import { withShield } from "@/core/security/shield";
import { notifyAdmin } from "@/utils/notifications";

async function submitContactFormBase(formData: ContactSubmission) {
  const supabase = createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from('contacts')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          contact_type: formData.contactType,
          company_name: formData.companyName,
          job_title: formData.jobTitle,
          interest: formData.interest,
          budget: formData.budget,
          timeline: formData.timeline,
          location: formData.location,
          linkedin_url: formData.linkedinUrl,
          whatsapp: formData.whatsapp,
          gender: formData.gender,
          marital_status: formData.maritalStatus,
          message: formData.message,
          newsletter_opt_in: formData.newsletterOptIn,
        }
      ]);

    if (error) {
      console.error("Supabase submission error:", error);
      return { success: false, message: `System failure: ${error.message} [Ref: TRANSMISSION_ERR]` };
    }

    // Trigger Admin Notification
    await notifyAdmin({
      title: "New Inquiry Received",
      message: `A new ${formData.interest} inquiry from ${formData.name}`,
      type: 'INQUIRY',
      data: {
        Email: formData.email,
        Interest: formData.interest,
        Location: formData.location
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
  const supabase = createServerSupabaseClient();

  try {
    if (!email || !email.includes('@')) {
      return { success: false, message: "Invalid node identity (Email)." };
    }

    // Try a resilient insert first (resort to message if newsletter_opt_in is missing)
    const { error } = await supabase
      .from('contacts')
      .insert([
        {
          name: 'Subscriber',
          email: email,
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
            email: email,
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


