/**
 * Syndication-specific queries for fetching content to syndicate
 */

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { Broadcast } from "./types";

export async function getArticlesForSyndication(limit = 20): Promise<Broadcast[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("content_type", "ARTICLE")
    .eq("status", "PUBLISHED")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching articles for syndication:", error);
    return [];
  }

  return (data || []) as Broadcast[];
}

export async function getSyndicationStatusForContent(contentId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("content_syndication")
    .select("*")
    .eq("source_content_id", contentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching syndication status:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    platform: row.platform,
    status: row.status,
    externalUrl: row.external_url,
    externalId: row.external_id,
    views: row.views_count || 0,
    likes: row.likes_count || 0,
    shares: row.shares_count || 0,
    comments: row.comments_count || 0,
    error: row.error_message,
    publishedAt: row.published_at,
  }));
}
