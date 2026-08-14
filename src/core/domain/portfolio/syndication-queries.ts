import { unstable_cache } from "next/cache";
import { createServerSupabaseClient } from "@/infrastructure/database/server";
import {
  ContentSyndication,
  SyndicationConfig,
} from "@/core/domain/portfolio/types";

/**
 * Syndication Queries - Database operations for content distribution
 */

const supabase = createServerSupabaseClient();

export async function getSyndicationConfigs(): Promise<SyndicationConfig[]> {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("syndication_config")
        .select("*")
        .eq("enabled", true);

      if (error) {
        console.error("Error fetching syndication configs:", error);
        return [];
      }

      return (data || []).map((row: any) => ({
        platform: row.platform,
        enabled: row.enabled,
        apiKey: row.api_key,
        username: row.username,
        customizations: {
          appendCanonicalUrl: row.append_canonical_url,
          appendAuthorBio: row.append_author_bio,
          appendCTA: row.append_cta,
        },
      }));
    },
    ["syndication-configs"],
    { revalidate: 3600, tags: ["syndication"] }
  )();
}

export async function getSyndicationStatus(
  sourceContentId: string
): Promise<ContentSyndication[]> {
  const { data, error } = await supabase
    .from("content_syndication")
    .select("*")
    .eq("source_content_id", sourceContentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching syndication status:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    sourceContentId: row.source_content_id,
    sourceContentType: row.source_content_type,
    platform: row.platform,
    externalUrl: row.external_url,
    externalId: row.external_id,
    status: row.status,
    publishedAt: row.published_at,
    syncedAt: row.last_sync_at,
    metrics: row.views_count || row.likes_count || row.shares_count
      ? {
          views: row.views_count,
          likes: row.likes_count,
          shares: row.shares_count,
          comments: row.comments_count,
        }
      : undefined,
    error: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function recordSyndication(
  sourceContentId: string,
  sourceContentType: string,
  platform: string,
  result: {
    success: boolean;
    externalId?: string;
    externalUrl?: string;
    error?: string;
  }
): Promise<ContentSyndication | null> {
  const { data, error } = await supabase
    .from("content_syndication")
    .upsert({
      source_content_id: sourceContentId,
      source_content_type: sourceContentType,
      platform,
      external_id: result.externalId,
      external_url: result.externalUrl,
      status: result.success ? "PUBLISHED" : "FAILED",
      error_message: result.error,
      published_at: result.success ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error recording syndication:", error);
    return null;
  }

  return {
    id: data.id,
    sourceContentId: data.source_content_id,
    sourceContentType: data.source_content_type,
    platform: data.platform,
    externalUrl: data.external_url,
    externalId: data.external_id,
    status: data.status,
    publishedAt: data.published_at,
    syncedAt: data.last_sync_at,
    error: data.error_message,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateSyndicationMetrics(
  syndicationId: string,
  metrics: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from("content_syndication")
    .update({
      views_count: metrics.views,
      likes_count: metrics.likes,
      shares_count: metrics.shares,
      comments_count: metrics.comments,
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", syndicationId);

  if (error) {
    console.error("Error updating syndication metrics:", error);
    return false;
  }

  return true;
}

export async function getPendingPublications(
  limit = 10
): Promise<Array<{ contentId: string; contentType: string; platforms: string[] }>> {
  const { data, error } = await supabase
    .from("content_syndication")
    .select("source_content_id, source_content_type, platform")
    .eq("status", "SCHEDULED")
    .limit(limit);

  if (error) {
    console.error("Error fetching pending publications:", error);
    return [];
  }

  // Group by content ID and collect platforms
  const grouped = new Map<
    string,
    { contentType: string; platforms: string[] }
  >();

  (data || []).forEach((row: any) => {
    const key = row.source_content_id;
    if (!grouped.has(key)) {
      grouped.set(key, {
        contentType: row.source_content_type,
        platforms: [],
      });
    }
    grouped.get(key)!.platforms.push(row.platform);
  });

  return Array.from(grouped.entries()).map(([contentId, value]) => ({
    contentId,
    contentType: value.contentType,
    platforms: value.platforms,
  }));
}
