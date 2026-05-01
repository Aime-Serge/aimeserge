import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { unstable_cache } from 'next/cache';
import { getAssetUrl } from "@/infrastructure/utils/storage";
import { myProjects, fallbackCertificates, fallbackBroadcasts } from "./constants";
import { Certificate, Broadcast } from "./types";

export async function getProjects() {
  return myProjects;
}

export async function getProjectBySlug(slug: string) {
  return myProjects.find((p) => p.slug === slug);
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
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[] | null;
  created_at: string;
  read_time: string;
  images: string[] | null;
  video_url: string | null;
  views: number | null;
  shares: number | null;
}

export async function getBroadcasts(): Promise<Broadcast[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      
      try {
        const { data, error } = await supabase
          .from('broadcasts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          return fallbackBroadcasts;
        }

        return (data as BroadcastRow[]).map((b) => ({
          id: b.id,
          title: b.title,
          content: b.content,
          excerpt: b.excerpt,
          category: b.category,
          tags: b.tags || [],
          createdAt: b.created_at,
          readTime: b.read_time,
          images: b.images || [],
          videoUrl: b.video_url || undefined,
          engagement: {
            views: b.views || 0,
            shares: b.shares || 0
          }
        }));
      } catch {
        return fallbackBroadcasts;
      }
    },
    ['broadcasts-feed'],
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

        return {
          id: data.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          tags: data.tags || [],
          createdAt: data.created_at,
          readTime: data.read_time,
          images: data.images || [],
          videoUrl: data.video_url,
          engagement: {
            views: data.views || 0,
            shares: data.shares || 0
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
