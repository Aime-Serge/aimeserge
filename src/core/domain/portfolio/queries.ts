import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { unstable_cache } from 'next/cache';
import { CONTENT_TTL, contentFallback } from "@/infrastructure/cache/content";
import { getAssetUrl } from "@/infrastructure/utils/storage";
import { myProjects, fallbackCertificates } from "./constants";
import {
  Certificate, Post, Article, MediaType, Visibility,
  CommentPermission, PublicationStatus, ContentBlock,
  Experience, Education, Organization, Achievement, Profile, Project
} from "./types";
import { SITE } from "@/config/site";

/**
 * Fetch Professional Experiences (Relational)
 */
export async function getExperiences(): Promise<Experience[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('experiences')
          .select('*, company:organizations(*)')
          .order('start_date', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no row
        if (!data) return [];

        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          employmentType: row.employment_type,
          location: row.location,
          locationType: row.location_type,
          startDate: row.start_date,
          endDate: row.end_date,
          description: row.description,
          skillsUsed: row.skills_used || [],
          companyId: row.company_id,
          company: row.company ? {
            id: row.company.id,
            name: row.company.name,
            logoUrl: row.company.logo_url,
            websiteUrl: row.company.website_url
          } : undefined
        }));
      } catch (err) {
        throw err;
      }
    },
    ['experiences-list'],
    { tags: ['experiences'], revalidate: CONTENT_TTL }
  )().catch(contentFallback([]));
}

/**
 * Fetch Educational Background (Relational)
 */
export async function getEducations(): Promise<Education[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('educations')
          .select('*, institution:organizations(*)')
          .order('end_date', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no row
        if (!data) return [];

        return data.map((row: any) => ({
          id: row.id,
          institutionId: row.institution_id,
          institution: row.institution ? {
            id: row.institution.id,
            name: row.institution.name,
            logoUrl: row.institution.logo_url,
            websiteUrl: row.institution.website_url
          } : undefined,
          degree: row.degree,
          fieldOfStudy: row.field_of_study,
          startDate: row.start_date,
          endDate: row.end_date,
          grade: row.grade,
          activities: row.activities,
          description: row.description
        }));
      } catch (err) {
        throw err;
      }
    },
    ['educations-list'],
    { tags: ['educations'], revalidate: CONTENT_TTL }
  )().catch(contentFallback([]));
}

export async function getProjects() {
  return unstable_cache(fetchProjects, ['projects-list'], { tags: ['projects'], revalidate: CONTENT_TTL })().catch(contentFallback(myProjects));
}

async function fetchProjects() {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return myProjects;

    return data.map(mapProjectRow);
  } catch (err) {
    throw err;
  }
}

export async function getProjectBySlug(slug: string) {
  return unstable_cache(() => fetchProjectBySlug(slug), ['project', slug], { tags: ['projects'], revalidate: CONTENT_TTL })().catch(contentFallback(myProjects.find((p) => p.slug === slug)));
}

async function fetchProjectBySlug(slug: string) {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_visible', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no row
    if (!data) return myProjects.find((p) => p.slug === slug);

    return mapProjectRow(data);
  } catch (err) {
    throw err;
  }
}

function mapProjectRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    role: row.role,
    url: row.url,
    pdfUrl: row.pdf_url,
    videoUrl: row.video_url,
    images: row.images ?? [],
    summary: row.summary,
    description: row.description,
    tools: row.tools ?? [],
    features: row.features ?? [],
    category: row.category,
    views: row.views,
    likes: row.likes,
    createdAt: row.created_at,
    isVisible: row.is_visible,
    startDate: row.start_date,
    endDate: row.end_date,
    isCurrent: row.is_current,
    contributors: row.contributors ?? [],
    association: row.association,
    metrics: row.metrics ?? [],
    featured: Boolean(row.featured),
    sortOrder: row.sort_order ?? 0
  };
}

export async function getCertificates(): Promise<Certificate[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*, issuer:organizations(*)')
          .order('issue_date', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) return fallbackCertificates;

        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          provider: c.provider,
          issueDate: c.issue_date,
          expiryDate: c.expiration_date || undefined,
          verifyUrl: c.verify_url || undefined,
          pdfUrl: getAssetUrl(c.pdf_url),
          description: c.description,
          issuerId: c.issuer_id,
          issuer: c.issuer ? {
            id: c.issuer.id,
            name: c.issuer.name,
            logoUrl: c.issuer.logo_url
          } : undefined,
          credentialId: c.credential_id
        }));
      } catch (err) {
        throw err;
      }
    },
    ['certificates-list'],
    { tags: ['certificates'], revalidate: CONTENT_TTL }
  )().catch(contentFallback(fallbackCertificates));
}

export async function getAchievements(): Promise<Achievement[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no row
        if (!data) return [];

        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description || undefined,
          issuer: row.issuer || undefined,
          achievedDate: row.achieved_date || undefined,
          url: row.url || undefined
        }));
      } catch (err) {
        throw err;
      }
    },
    ['achievements-list'],
    { tags: ['achievements'], revalidate: CONTENT_TTL }
  )().catch(contentFallback([]));
}

export async function getPosts(): Promise<Post[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, article:articles(*)')
          .order('created_at', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no row
        if (!data) return [];

        // Hide feed posts whose article is still a draft (the server key can see drafts).
        return data
          .filter((row: any) => !row.article || row.article.status === 'PUBLISHED')
          .map(mapPostRow);
      } catch (err) {
        throw err;
      }
    },
    ['posts-feed'],
    { tags: ['posts'], revalidate: CONTENT_TTL }
  )().catch(contentFallback([]));
}

function mapPostRow(row: any): Post {
  return {
    id: row.id,
    textContent: row.text_content,
    mediaType: row.media_type as MediaType,
    mediaPayload: row.media_payload || {},
    articleId: row.article_id,
    article: row.article ? mapArticleRow(row.article) : undefined,
    engagement: {
      views: row.views || 0,
      shares: row.shares || 0,
      likes: row.likes || 0
    },
    createdAt: row.created_at,
    hashtags: row.hashtags || []
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'PUBLISHED')
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no row
        if (!data) return null;

        return mapArticleRow(data);
      } catch (err) {
        throw err;
      }
    },
    [`article-${slug}`],
    { tags: ['articles', `article-${slug}`], revalidate: CONTENT_TTL }
  )().catch(contentFallback(null));
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no row
  if (!data) return null;
  return mapArticleRow(data);
}

function mapArticleRow(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    excerpt: row.excerpt,
    bodyContent: row.body_content as ContentBlock[],
    estimatedReadTime: row.estimated_read_time || 1,
    status: row.status as PublicationStatus,
    category: row.category || undefined,
    tags: row.tags || [],
    publishedAt: row.published_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Keep legacy export for backward compatibility
export const getBroadcasts = getPosts as any;
export const getBroadcastById = getArticleById as any;
export const getLatestResume = async () => null; // Fallback

// ─── Profile & featured work (homepage) ──────────────────────────────────

export const DEFAULT_PROFILE: Profile = {
  headline: "I build secure, reliable software, and add AI where it actually helps.",
  bio: "I'm Aime Serge. I design and build web apps and APIs, keep them safe from common attacks, and add AI features like smart search and chat assistants.",
  location: SITE.location,
  openToWork: false,
  availabilityNote: "",
  cvUrl: "/uploads/Aime_Serge_Ukobizaba_CV_01-3.pdf",
};

export async function getProfile(): Promise<Profile> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.from('profile').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_PROFILE;
      return {
        headline: data.headline || DEFAULT_PROFILE.headline,
        bio: data.bio || DEFAULT_PROFILE.bio,
        location: data.location || DEFAULT_PROFILE.location,
        openToWork: Boolean(data.open_to_work),
        availabilityNote: data.availability_note || "",
        cvUrl: data.cv_url || DEFAULT_PROFILE.cvUrl,
      };
    },
    ['profile'],
    { tags: ['profile'], revalidate: CONTENT_TTL }
  )().catch(contentFallback(DEFAULT_PROFILE));
}

/** Projects marked "featured" (by sort order); falls back to the newest three. */
export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = (await getProjects()) as Project[];
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return (featured.length ? featured : projects).slice(0, limit);
}

/** Published articles, newest first, for the RSS feed. */
export async function getPublishedArticles(limit = 30): Promise<Article[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'PUBLISHED')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map(mapArticleRow);
    },
    ['articles-published', String(limit)],
    { tags: ['articles'], revalidate: CONTENT_TTL }
  )().catch(contentFallback([] as Article[]));
}
