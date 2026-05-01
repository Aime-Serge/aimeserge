import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export { securityHeaders } from "./securityHeaders";

/**
 * Utility for merging Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
