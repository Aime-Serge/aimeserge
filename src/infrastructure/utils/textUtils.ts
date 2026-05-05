/**
 * LinkedIn-Style Content Utilities
 */

/**
 * Parses text for hashtags and returns them as an array.
 * Enforces social platform discovery logic.
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0080-\uFFFF]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
}

/**
 * Truncates text for the initial "Hook" view.
 * Defaults to ~240 characters or 3 newlines as per LinkedIn optimization.
 */
export function getHookContent(text: string, limit = 240): string {
  if (text.length <= limit) return text;
  
  // Truncate at last space before limit to avoid cutting words
  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.slice(0, lastSpace > 0 ? lastSpace : limit) + '...';
}

/**
 * Validates and sanitizes polymorphic media payloads.
 */
export function validateMediaPayload(type: string, payload: Record<string, unknown>) {
  const constraints: Record<string, string[]> = {
    'IMAGE': ['url'],
    'IMAGE_CAROUSEL': ['images'],
    'VIDEO': ['videoUrl'],
    'DOCUMENT': ['url', 'title'],
    'EXTERNAL_LINK': ['url', 'ogTitle']
  };

  if (type === 'NONE') return true;
  
  const required = constraints[type];
  if (!required) return false;

  return required.every(field => !!payload[field]);
}
