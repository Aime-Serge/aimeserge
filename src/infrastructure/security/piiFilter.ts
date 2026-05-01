/**
 * Responsible AI Utility: PII Filter
 * Redacts sensitive information from user input before sending to LLM.
 */

const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
  // Matches common API key formats (sk-..., AIza..., etc.)
  apiKey: /\b(?:sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9\-_]{35}|sbp_[a-zA-Z0-9]{40}|pk_(?:live|test)_[a-zA-Z0-9]{24,}|AKIA[0-9A-Z]{16})\b/g,
  // Broad international phone number pattern
  phone: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
  // Social Security Numbers (US format)
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  // IP Addresses (IPv4)
  ipv4: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  // Generic password/secret patterns (password=...)
  secret: /\b(?:password|passwd|secret|token|key|pwd)\s*[=:]\s*['"]?([^'"\s]+)['"]?/gi,
};

export function redactPII(text: string): string {
  let redacted = text;

  redacted = redacted.replace(PII_PATTERNS.email, "[EMAIL_REDACTED]");
  redacted = redacted.replace(PII_PATTERNS.creditCard, "[CARD_REDACTED]");
  redacted = redacted.replace(PII_PATTERNS.apiKey, "[KEY_REDACTED]");
  redacted = redacted.replace(PII_PATTERNS.phone, "[PHONE_REDACTED]");
  redacted = redacted.replace(PII_PATTERNS.ssn, "[SSN_REDACTED]");
  redacted = redacted.replace(PII_PATTERNS.ipv4, "[IP_REDACTED]");
  
  // Custom replace for secrets to keep the key but redact the value
  redacted = redacted.replace(PII_PATTERNS.secret, (match, p1) => {
    return match.replace(p1, "[SECRET_REDACTED]");
  });

  return redacted;
}

