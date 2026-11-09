"use server";

/**
 * Admin write actions for the blog and the profile.
 * Every export here is a public endpoint, so each one checks the admin session first.
 */
import { z } from "zod";
import { validateAdminSession } from "./queries";
import { withShield } from "@/infrastructure/security/shield";
import { revalidateContent } from "@/infrastructure/cache/content";
import { sanitizeContentBlocks } from "@/infrastructure/security/sanitizer";
import { markdownToBlocks, blocksToPlainText, slugify } from "@/infrastructure/utils/markdownBlocks";
import { upsertKnowledge, deleteKnowledge } from "@/core/domain/ai/mutations";
import type { ContentBlock } from "@/core/domain/portfolio/types";

export type ActionResult<T = undefined> = { success: true; data?: T; message: string } | { success: false; message: string };

// ─── Articles ──────────────────────────────────────────────────────────────

const ARTICLE_CATEGORIES = ["Engineering", "Security", "Cloud", "AI", "Career"] as const;

const articleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Title is too short.").max(200),
  slug: z.string().trim().max(120).optional(),
  excerpt: z.string().trim().min(10, "Add a one- or two-sentence summary.").max(500),
  markdown: z.string().min(20, "The article body is too short.").max(100_000),
  category: z.enum(ARTICLE_CATEGORIES).default("Engineering"),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  coverImageUrl: z.string().trim().url("Cover image must be a full URL.").max(500).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type ArticleInput = z.input<typeof articleSchema>;

async function saveArticleBase(input: ArticleInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await validateAdminSession();
    const parsed = articleSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message || "Check the form." };
    const a = parsed.data;

    const slug = slugify(a.slug || a.title);
    if (!slug) return { success: false, message: "Title must contain letters or numbers." };

    const blocks = sanitizeContentBlocks(markdownToBlocks(a.markdown)) as ContentBlock[];

    // Keep the first publish date when re-saving a published article.
    let publishedAt: string | null = null;
    if (a.status === "PUBLISHED") {
      if (a.id) {
        const { data: existing } = await supabase.from("articles").select("published_at").eq("id", a.id).maybeSingle();
        publishedAt = existing?.published_at || new Date().toISOString();
      } else {
        publishedAt = new Date().toISOString();
      }
    }

    const row = {
      ...(a.id ? { id: a.id } : {}),
      title: a.title,
      slug,
      excerpt: a.excerpt,
      body_content: blocks,
      category: a.category,
      tags: a.tags,
      cover_image_url: a.coverImageUrl || null,
      status: a.status,
      published_at: publishedAt,
    };

    const { data, error } = await supabase.from("articles").upsert(row).select("id, slug").single();
    if (error) {
      if (error.code === "23505") return { success: false, message: `Another article already uses the link "/blog/${slug}". Change the title or link.` };
      throw error;
    }

    // The DB trigger creates the feed post on first publish; keep it in sync,
    // and remove it while the article is a draft so the feed never links to a 404.
    if (a.status === "PUBLISHED") {
      await supabase.from("posts").update({ text_content: a.excerpt, category: a.category, hashtags: a.tags }).eq("article_id", data.id);
      await upsertKnowledge({
        id: data.id,
        content: `Article: ${a.title}\nSummary: ${a.excerpt}\nTags: ${a.tags.join(", ")}\n\n${blocksToPlainText(blocks).slice(0, 8000)}`,
        metadata: { type: "blog", slug, title: a.title, url: `/blog/${slug}` },
      });
    } else {
      await supabase.from("posts").delete().eq("article_id", data.id);
      await deleteKnowledge(data.id);
    }

    revalidateContent("articles");
    return {
      success: true,
      data: { id: data.id, slug: data.slug },
      message: a.status === "PUBLISHED" ? "Published. It's live on /blog now." : "Saved as a draft. Not visible to visitors.",
    };
  } catch (err) {
    console.error("saveArticle failed:", err);
    return { success: false, message: err instanceof Error ? err.message : "Couldn't save the article." };
  }
}

const shieldedSaveArticle = withShield("save_article", saveArticleBase, { limit: 30, auditLog: true });
export async function saveArticle(input: ArticleInput) {
  return shieldedSaveArticle(input);
}

// ─── Profile ───────────────────────────────────────────────────────────────

const profileSchema = z.object({
  headline: z.string().trim().min(10, "Headline is too short.").max(160),
  bio: z.string().trim().min(20, "Bio is too short.").max(600),
  location: z.string().trim().max(100).default(""),
  openToWork: z.boolean().default(false),
  availabilityNote: z.string().trim().max(120).default(""),
  cvUrl: z.string().trim().max(500).refine((v) => !v || v.startsWith("/") || /^https:\/\//.test(v), "CV link must start with / or https://").default(""),
});

export type ProfileInput = z.input<typeof profileSchema>;

async function saveProfileBase(input: ProfileInput): Promise<ActionResult> {
  try {
    const supabase = await validateAdminSession();
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message || "Check the form." };
    const p = parsed.data;

    const { error } = await supabase.from("profile").upsert({
      id: 1,
      headline: p.headline,
      bio: p.bio,
      location: p.location || null,
      open_to_work: p.openToWork,
      availability_note: p.availabilityNote || null,
      cv_url: p.cvUrl || null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;

    revalidateContent("profile");
    return { success: true, message: "Profile saved. The homepage is updated." };
  } catch (err) {
    console.error("saveProfile failed:", err);
    return { success: false, message: err instanceof Error ? err.message : "Couldn't save the profile." };
  }
}

const shieldedSaveProfile = withShield("save_profile", saveProfileBase, { limit: 20, auditLog: true });
export async function saveProfile(input: ProfileInput) {
  return shieldedSaveProfile(input);
}

/** Current profile for the admin form (falls back to the site defaults). */
export async function getProfileForAdmin(): Promise<ActionResult<ProfileInput>> {
  try {
    const supabase = await validateAdminSession();
    const { data, error } = await supabase.from("profile").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    const { DEFAULT_PROFILE } = await import("@/core/domain/portfolio/queries");
    return {
      success: true,
      message: data ? "Loaded." : "No profile saved yet: showing the defaults.",
      data: {
        headline: data?.headline ?? DEFAULT_PROFILE.headline,
        bio: data?.bio ?? DEFAULT_PROFILE.bio,
        location: data?.location ?? DEFAULT_PROFILE.location,
        openToWork: data?.open_to_work ?? DEFAULT_PROFILE.openToWork,
        availabilityNote: data?.availability_note ?? "",
        cvUrl: data?.cv_url ?? DEFAULT_PROFILE.cvUrl,
      },
    };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Couldn't load the profile. Has the phase 2 migration been applied?" };
  }
}
