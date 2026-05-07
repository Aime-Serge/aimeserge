/**
 * Formats a date range and calculates duration.
 * Example: "Dec 2025 - Present • 6 mos"
 */
export function formatDuration(startDate: string, endDate?: string) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const endStr = endDate ? end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';

  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let durationStr = "";
  if (years > 0) durationStr += `${years} yr${years > 1 ? 's' : ''} `;
  if (months > 0 || totalMonths === 0) durationStr += `${months === 0 ? 1 : months} mo${months > 1 ? 's' : ''}`;

  return `${startStr} - ${endStr} • ${durationStr.trim()}`;
}
