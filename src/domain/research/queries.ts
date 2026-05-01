import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { unstable_cache } from 'next/cache';
import { getAssetUrl } from "@/infrastructure/utils/storage";
import { type ResearchPaper, fallbackResearch } from "./types";

export async function getResearch(): Promise<ResearchPaper[]> {
  return unstable_cache(
    async () => {
      const supabase = createServerSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('research')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) return fallbackResearch;

        return data.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          abstract: r.abstract,
          pdfUrl: getAssetUrl(r.pdf_url),
          tags: r.tags || [],
          views: r.views || 0,
          downloads: r.downloads || 0,
          createdAt: new Date(r.created_at).toISOString().split('T')[0],
        }));
      } catch {
        return fallbackResearch;
      }
    },
    ['research-list'],
    { tags: ['research'], revalidate: 3600 }
  )();
}

export async function getPaperBySlug(slug: string): Promise<ResearchPaper | null> {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('research')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      abstract: data.abstract,
      pdfUrl: getAssetUrl(data.pdf_url),
      tags: data.tags || [],
      views: data.views || 0,
      downloads: data.downloads || 0,
      createdAt: new Date(data.created_at).toISOString().split('T')[0],
    };
  } catch {
    return null;
  }
}
