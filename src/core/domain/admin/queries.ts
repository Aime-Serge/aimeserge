import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { getEnvVar } from "@/infrastructure/utils/env";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/**
 * Validates the admin session by checking the secure auth token.
 * This is used internally by other admin actions.
 * 
 * NOTE: This function uses next/headers, so it must only be called
 * from Server Components or Server Actions.
 */
export async function validateAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const jwtSecret = getEnvVar('JWT_SECRET');
  const adminEmail = getEnvVar('ADMIN_EMAIL');

  if (!token || !jwtSecret || !adminEmail) {
    throw new Error("Unauthorized Access: Admin privileges required.");
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'authenticated' || payload.email !== adminEmail) {
      throw new Error("Unauthorized Access: Identity mismatch.");
    }

    return createServerSupabaseClient();
  } catch {
    throw new Error("Unauthorized Access: Session expired or invalid.");
  }
}

/**
 * Any pure Server-side queries that are NOT called from the client
 * can be added here. Functions here should NOT be imported by 
 * Client Components.
 */
