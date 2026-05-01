import { headers } from "next/headers";
import { rateLimit } from "./rateLimit";
import { redactPII } from "./piiFilter";
import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { notifyAdmin } from "@/infrastructure/utils/notifications";

interface ShieldOptions {
  limit?: number;
  windowInMs?: number;
  auditLog?: boolean;
  redact?: boolean;
}

const DEFAULT_OPTIONS: ShieldOptions = {
  limit: 10,
  windowInMs: 60 * 1000, // 1 minute
  auditLog: true,
  redact: false,
};

/**
 * Security Shield HOF for Server Actions
 */
export function withShield<T, R>(
  actionName: string,
  fn: (data: T) => Promise<R>,
  options: ShieldOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async (data: T): Promise<R | { success: false; message: string }> => {
    // 1. Get request context
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    const ua = headerList.get("user-agent") || "unknown";

    // 2. Rate Limiting
    const rate = await rateLimit.check(config.limit!, config.windowInMs!, ip);
    if (!rate.success) {
      // Notify Admin of potential Brute Force / Rate Limit violation
      await notifyAdmin({
        title: "Rate Limit Triggered",
        message: `Security intercept: IP ${ip} exceeded limits on ${actionName}`,
        type: 'SECURITY',
        data: { Action: actionName, IP: ip }
      });

      return { 
        success: false, 
        message: "Request synchronization failed. Rate limit exceeded." 
      };
    }

    // 3. Input Sanitization / PII Redaction
    let sanitizedData = data;
    if (config.redact) {
      if (typeof data === "string") {
        sanitizedData = redactPII(data) as unknown as T;
      } else if (typeof data === "object" && data !== null) {
        sanitizedData = JSON.parse(redactPII(JSON.stringify(data))) as T;
      }
    }

    // 4. Audit Logging (Unified with security_logs)
    if (config.auditLog) {
      const supabase = createServerSupabaseClient();
      try {
        await supabase.from("security_logs").insert({
          event_type: `ACTION_${actionName.toUpperCase()}`,
          ip_address: ip,
          user_agent: ua,
          severity: 'INFO',
          metadata: { action: actionName }
        });
      } catch (err) {
        console.error("Audit logging failed:", err);
      }
    }

    try {
      return await fn(sanitizedData);
    } catch (error) {
      console.error(`Shield caught error in ${actionName}:`, error);
      return { 
        success: false, 
        message: "Internal security intercept. Action terminated." 
      };
    }
  };
}
