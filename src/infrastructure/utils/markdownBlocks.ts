import type { ContentBlock } from "@/core/domain/portfolio/types";

/**
 * Tiny, dependency-free Markdown <-> content-block converter for the admin editor.
 * Supports: # headings, paragraphs, - / 1. lists, ```code```, > notes,
 * ![alt](url) images, and inline **bold**, *italic*, `code`, [links](url).
 * Output HTML is sanitised again on save and on render.
 */

let counter = 0;
const newId = () => `b${Date.now().toString(36)}${(counter++).toString(36)}`;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(md: string): string {
  return escapeHtml(md)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function markdownToBlocks(md: string): ContentBlock[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({ id: newId(), type: "paragraph", data: { text: inline(para.join(" ")) } });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ id: newId(), type: "list", data: { items: list.items.map(inline) } });
    list = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushPara(); flushList();
      const language = trimmed.slice(3).trim() || "text";
      const code: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i]);
      blocks.push({ id: newId(), type: "code", data: { language, code: code.join("\n") } });
      continue;
    }
    if (!trimmed) { flushPara(); flushList(); continue; }

    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushPara(); flushList();
      blocks.push({ id: newId(), type: "heading", data: { level: heading[1].length + 1, text: inline(heading[2]) } });
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(trimmed);
    if (image) {
      flushPara(); flushList();
      blocks.push({ id: newId(), type: "image", data: { url: image[2], altText: image[1], caption: image[1] } });
      continue;
    }
    if (trimmed.startsWith("> ")) {
      flushPara(); flushList();
      blocks.push({ id: newId(), type: "callout", data: { type: "info", text: inline(trimmed.slice(2)) } });
      continue;
    }
    const item = /^(?:[-*]|\d+\.)\s+(.*)$/.exec(trimmed);
    if (item) {
      flushPara();
      const ordered = /^\d+\./.test(trimmed);
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push(item[1]);
      continue;
    }
    flushList();
    para.push(trimmed);
  }
  flushPara(); flushList();
  return blocks;
}

function htmlToMd(html = ""): string {
  return html
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<b>(.*?)<\/b>/g, "**$1**")
    .replace(/<em>(.*?)<\/em>/g, "*$1*")
    .replace(/<i>(.*?)<\/i>/g, "*$1*")
    .replace(/<code>(.*?)<\/code>/g, "`$1`")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, "[$2]($1)")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

/** Used to pre-fill the editor when editing an existing article. */
export function blocksToMarkdown(blocks: ContentBlock[] | null | undefined): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((b) => {
      const d = b.data || {};
      switch (b.type) {
        case "heading": return `${"#".repeat(Math.max(1, (d.level || 2) - 1))} ${htmlToMd(d.text)}`;
        case "list": return (d.items || []).map((it) => `- ${htmlToMd(it)}`).join("\n");
        case "code": return "```" + (d.language || "") + "\n" + (d.code || "") + "\n```";
        case "callout": return `> ${htmlToMd(d.text)}`;
        case "image": return `![${d.altText || d.caption || ""}](${d.url || ""})`;
        default: return htmlToMd(d.text);
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export function slugify(s: string): string {
  return s
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

/** Plain text for search embeddings and RSS descriptions. */
export function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocksToMarkdown(blocks).replace(/[#*`>\[\]()!-]/g, " ").replace(/\s+/g, " ").trim();
}
