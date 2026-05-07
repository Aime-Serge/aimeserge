import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { unstable_cache } from 'next/cache';
import { getAssetUrl } from "@/infrastructure/utils/storage";
import { myProjects, fallbackCertificates } from "./constants";
import { 
  Certificate, Post, Article, MediaType, Visibility, 
  CommentPermission, PublicationStatus, ContentBlock,
  Experience, Education, Organization
} from "./types";

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

        if (error || !data) return [];

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
        console.error("Failed to fetch experiences:", err);
        return [];
      }
    },
    ['experiences-list'],
    { tags: ['experiences'], revalidate: 3600 }
  )();
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

        if (error || !data) return [];

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
        console.error("Failed to fetch educations:", err);
        return [];
      }
    },
    ['educations-list'],
    { tags: ['educations'], revalidate: 3600 }
  )();
}

export async function getProjects() {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return myProjects;

    return data.map(mapProjectRow);
  } catch {
    return myProjects;
  }
}

export async function getProjectBySlug(slug: string) {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_visible', true)
      .single();

    if (error || !data) return myProjects.find((p) => p.slug === slug);

    return mapProjectRow(data);
  } catch {
    return myProjects.find((p) => p.slug === slug);
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
    association: row.association
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

        if (error || !data || data.length === 0) return fallbackCertificates;

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
      } catch {
        return fallbackCertificates;
      }
    },
    ['certificates-list'],
    { tags: ['certificates'], revalidate: 3600 }
  )();
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

        if (error || !data) return [];

        return data.map(mapPostRow);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        return [];
      }
    },
    ['posts-feed'],
    { tags: ['posts'], revalidate: 60 }
  )();
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

        if (error || !data) return null;

        return mapArticleRow(data);
      } catch {
        return null;
      }
    },
    [`article-${slug}`],
    { tags: [`article-${slug}`], revalidate: 60 }
  )();
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
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
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Keep legacy export for backward compatibility
export const getBroadcasts = getPosts as any;
export const getBroadcastById = getArticleById as any;
export const getLatestResume = async () => null; // Fallback
