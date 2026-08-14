import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe", "figure", "figcaption"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    iframe: ["src", "title", "allow", "allowfullscreen"],
  },
  allowedSchemes: ["http", "https", "data", "blob"],
  allowedSchemesByTag: {
    img: ["http", "https", "data", "blob"],
  },
  transformTags: {
    // Strip any inline event handlers
    "*": (tagName, attribs) => {
      const cleanAttribs: Record<string, string> = {};
      for (const [k, v] of Object.entries(attribs)) {
        if (!k.toLowerCase().startsWith('on')) {
          cleanAttribs[k] = v as string;
        }
      }
      return { tagName, attribs: cleanAttribs };
    }
  }
};

export function sanitizeHtmlContent(html: string) {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export function sanitizeContentBlocks(blocks: unknown): unknown {
  if (!blocks || !Array.isArray(blocks)) return blocks;

  return (blocks as any[]).map((block) => {
    try {
      if (block && typeof block === 'object') {
        const b: any = { ...block };
        if (b.data) {
          if (typeof b.data.text === 'string') {
            b.data.text = sanitizeHtmlContent(b.data.text);
          }
          if (Array.isArray(b.data.items)) {
            b.data.items = b.data.items.map((it: string) => sanitizeHtmlContent(String(it)));
          }
          if (typeof b.data.code === 'string') {
            // Keep code blocks raw (escaped by React) but strip harmful tags
            b.data.code = String(b.data.code);
          }
          if (typeof b.data.url === 'string') {
            b.data.url = String(b.data.url);
          }
        }
        return b;
      }
      return block;
    } catch (e) {
      return block;
    }
  });
}

const ALLOWED_IFRAME_HOSTNAMES = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'player.vimeo.com'
];

export function isAllowedIframeSrc(urlString?: string) {
  if (!urlString) return false;
  try {
    const u = new URL(urlString);
    const host = u.hostname.toLowerCase();
    if (ALLOWED_IFRAME_HOSTNAMES.includes(host)) return true;

    // Allow internal storage host (Supabase) if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      try {
        const s = new URL(supabaseUrl);
        if (host === s.hostname) return true;
      } catch {}
    }

    return false;
  } catch {
    return false;
  }
}

export default sanitizeHtmlContent;
