import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { unstable_cache } from 'next/cache';
import { getAssetUrl } from "@/infrastructure/utils/storage";
import { myProjects, fallbackCertificates, fallbackBroadcasts } from "./constants";
import { Certificate, Broadcast, ContentType, PublicationStatus, MediaType, Entity, MediaPayload, ContentBlock, Visibility, CommentPermission } from "./types";

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

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  role: string;
  url: string | null;
  pdf_url: string | null;
  video_url: string | null;
  images: string[] | null;
  summary: string;
  description: string;
  tools: string[] | null;
  features: string[] | null;
  category: "AI" | "Security" | "Cloud" | "Full-Stack" | "Software Engineering";
  views: number | null;
  likes: number | null;
  created_at: string;
  is_visible: boolean | null;
  is_current: boolean | null;
  start_date: { month: string; year: string } | null;
  end_date: { month: string; year: string } | null;
  contributors: string[] | null;
  association: string | null;
}

function mapProjectRow(row: ProjectRow) {
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
    isCurrent: row.is_current,
    startDate: row.start_date,
    endDate: row.end_date,
    contributors: row.contributors ?? [],
    association: row.association ?? undefined
  };
}

export async function getLatestResume() {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .list('', { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });

    if (error || !data || data.length === 0) return null;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(data[0].name);

    return publicUrl;
  } catch {
    return null;
  }
}

interface CertificateRow {
  id: string;
  name: string;
  provider: string;
  issue_date: string;
  expiry_date: string | null;
  verify_url: string | null;
  pdf_url: string;
  description: string;
}

export async function getCertificates(): Promise<Certificate[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('issue_date', { ascending: false });

        if (error || !data || data.length === 0) return fallbackCertificates;

        return (data as CertificateRow[]).map((c) => ({
          id: c.id,
          name: c.name,
          provider: c.provider,
          issueDate: c.issue_date,
          expiryDate: c.expiry_date || undefined,
          verifyUrl: c.verify_url || undefined,
          pdfUrl: getAssetUrl(c.pdf_url),
          description: c.description,
        }));
      } catch {
        return fallbackCertificates;
      }
    },
    ['certificates-list'],
    { tags: ['certificates'], revalidate: 3600 }
  )();
}

interface BroadcastRow {
  id: string;
  content_type: string;
  status: string;
  slug: string;
  title: string;
  text_content: string | null;
  media_type: string | null;
  media_payload: MediaPayload | null;
  body_blocks: ContentBlock[] | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  excerpt: string | null;
  estimated_read_time: number | null;
  is_edited: boolean;
  entities: Entity[] | null;
  hashtags: string[];
  visibility_restricted: string;
  comment_permissions: string;
  category: string;
  created_at: string;
  updated_at: string;
  views: number | null;
  shares: number | null;
  likes: number | null;
}

export async function getBroadcasts(filter?: { type?: ContentType, status?: PublicationStatus }): Promise<Broadcast[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      
      try {
        let query = supabase.from('broadcasts').select('*');
        
        if (filter?.type) query = query.eq('content_type', filter.type);
        if (filter?.status) query = query.eq('status', filter.status);
        else query = query.eq('status', 'PUBLISHED'); // Default to only published

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          return fallbackBroadcasts;
        }

        return (data as BroadcastRow[]).map((b) => ({
          id: b.id,
          contentType: b.content_type as ContentType,
          status: b.status as PublicationStatus,
          slug: b.slug,
          title: b.title,
          content: b.text_content || undefined,
          textContent: b.text_content || undefined,
          mediaType: b.media_type as MediaType || undefined,
          mediaPayload: b.media_payload || undefined,
          bodyBlocks: b.body_blocks || undefined,
          coverImageUrl: b.cover_image_url || undefined,
          coverImageAlt: b.cover_image_alt || undefined,
          excerpt: b.excerpt || undefined,
          estimatedReadTime: b.estimated_read_time || 0,
          readTime: b.estimated_read_time ? `${b.estimated_read_time} min read` : "1 min read",
          isEdited: b.is_edited,
          entities: b.entities || [],
          hashtags: b.hashtags || [],
          tags: b.hashtags || [],
          visibilityRestricted: b.visibility_restricted as Visibility,
          commentPermissions: b.comment_permissions as CommentPermission,
          category: b.category,
          createdAt: b.created_at,
          updatedAt: b.updated_at,
          engagement: {
            views: b.views || 0,
            shares: b.shares || 0,
            likes: b.likes || 0
          }
        }));
      } catch {
        return fallbackBroadcasts;
      }
    },
    ['broadcasts-feed', JSON.stringify(filter)],
    { tags: ['broadcasts'], revalidate: 60 }
  )();
}

export async function getBroadcastById(id: string): Promise<Broadcast | null> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('broadcasts')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) return fallbackBroadcasts.find(b => b.id === id) || null;

        const row = data as BroadcastRow & {
          content?: string | null;
          tags?: string[] | null;
          read_time?: string | null;
          images?: string[] | null;
          video_url?: string | null;
        };

        return {
          id: row.id,
          contentType: row.content_type as ContentType || 'POST',
          status: row.status as PublicationStatus || 'PUBLISHED',
          slug: row.slug,
          title: row.title,
          content: row.content || row.text_content || undefined,
          excerpt: row.excerpt || undefined,
          category: row.category,
          tags: row.tags || row.hashtags || [],
          hashtags: row.hashtags || row.tags || [],
          createdAt: row.created_at,
          readTime: row.read_time || (row.estimated_read_time ? `${row.estimated_read_time} min read` : "1 min read"),
          images: row.images || [],
          videoUrl: row.video_url || undefined,
          isEdited: row.is_edited || false,
          entities: row.entities || [],
          visibilityRestricted: (row.visibility_restricted as Visibility) || 'ANYONE',
          commentPermissions: (row.comment_permissions as CommentPermission) || 'ANYONE',
          engagement: {
            views: row.views || 0,
            shares: row.shares || 0,
            likes: row.likes || 0
          }
        };
      } catch {
        return fallbackBroadcasts.find(b => b.id === id) || null;
      }
    },
    [`broadcast-${id}`],
    { tags: [`broadcast-${id}`], revalidate: 60 }
  )();
}
