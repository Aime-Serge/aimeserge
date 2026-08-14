/**
 * Syndication Actions - Client-safe actions for triggering content distribution
 * Handles publishing content to multiple platforms (Medium, Dev.to, LinkedIn, Hashnode)
 */

"use server";

import { ContentSyndicationService } from "@/core/application/services/SyndicationService";
import {
  getSyndicationConfigs,
  recordSyndication,
} from "@/core/domain/portfolio/syndication-queries";
import { Broadcast, SyndicationPlatform } from "@/core/domain/portfolio/types";

/**
 * Check if a string is a valid SyndicationPlatform
 */
function isValidPlatform(platform: string): platform is SyndicationPlatform {
  const validPlatforms: SyndicationPlatform[] = [
    "MEDIUM",
    "DEV_TO",
    "LINKEDIN",
    "HASHNODE",
    "SUBSTACK",
    "PERSONAL_BLOG",
  ];
  return validPlatforms.includes(platform as SyndicationPlatform);
}

/**
 * Prepare content for syndication
 * Formats article/post data into platform-agnostic syndication content
 */
function formatContentForSyndication(
  broadcast: Broadcast,
  baseUrl: string = "https://aimeserge.me"
) {
  const contentUrl = `${baseUrl}/blog/${broadcast.slug}`;

  // Prepare content with metadata matching SyndicationContent interface
  const content = {
    title: broadcast.title,
    excerpt: broadcast.excerpt,
    content: broadcast.text_content || "", // Required field
    canonicalUrl: contentUrl,
    tags: broadcast.hashtags || [],
    coverImageUrl: broadcast.coverImageUrl,
    authorBio:
      "Software Engineer & AI Researcher. Building scalable systems at the intersection of cloud and intelligence.",
  };

  return content;
}

/**
 * Syndicate content to enabled platforms
 * Called after article/post is published
 * Errors are logged but don't fail the publish
 */
export async function syndicateContentAction(
  broadcast: Broadcast,
  platforms?: string[]
): Promise<{
  success: boolean;
  syndicatedPlatforms: string[];
  failedPlatforms: string[];
  errors: Record<string, string>;
}> {
  try {
    // Validate input
    if (!broadcast.id || !broadcast.slug) {
      throw new Error("Invalid content: missing id or slug");
    }

    // Get enabled syndication configs
    const configs = await getSyndicationConfigs();

    if (configs.length === 0) {
      console.info("No syndication platforms configured");
      return {
        success: true,
        syndicatedPlatforms: [],
        failedPlatforms: [],
        errors: {},
      };
    }

    // Filter to requested platforms if specified
    const targetPlatforms = platforms
      ? configs
          .filter((c) => platforms.includes(c.platform as string))
          .map((c) => c.platform as string)
      : configs.map((c) => c.platform as string);

    if (targetPlatforms.length === 0) {
      console.warn("No platforms available for syndication");
      return {
        success: true,
        syndicatedPlatforms: [],
        failedPlatforms: [],
        errors: {},
      };
    }

    // Format content for syndication
    const syndicationContent = formatContentForSyndication(broadcast);

    // Initialize syndication service
    const syndicationService = new ContentSyndicationService(configs);

    // Filter and validate platforms
    const validPlatforms = (platforms || []).filter(isValidPlatform);
    if (validPlatforms.length === 0) {
      console.log("No valid platforms specified or enabled for syndication");
      return {
        success: true,
        syndicatedPlatforms: [],
        failedPlatforms: [],
        errors: {},
      };
    }

    // Publish to all platforms
    const results = await syndicationService.publishToAll(
      syndicationContent,
      validPlatforms
    );

    // Track results in database
    const syndicatedPlatforms: string[] = [];
    const failedPlatforms: string[] = [];
    const errors: Record<string, string> = {};

    for (const [platform, result] of results.entries()) {
      if (result.success) {
        syndicatedPlatforms.push(platform);
        await recordSyndication(
          broadcast.id,
          "ARTICLE",
          platform,
          result
        );
      } else {
        failedPlatforms.push(platform);
        errors[platform] = result.error || "Unknown error";
        await recordSyndication(
          broadcast.id,
          "ARTICLE",
          platform,
          result
        );
      }
    }

    const allSuccess = failedPlatforms.length === 0;

    if (allSuccess) {
      console.info(
        `✅ Content syndicated successfully to ${syndicatedPlatforms.join(", ")}`
      );
    } else {
      console.warn(
        `⚠️ Partial syndication: ${syndicatedPlatforms.length} succeeded, ${failedPlatforms.length} failed`,
        { errors }
      );
    }

    return {
      success: allSuccess,
      syndicatedPlatforms,
      failedPlatforms,
      errors,
    };
  } catch (error) {
    console.error("Syndication action failed:", error);

    // Return error details but don't throw
    // This prevents syndication errors from breaking the publish flow
    return {
      success: false,
      syndicatedPlatforms: [],
      failedPlatforms: [],
      errors: {
        "SYSTEM": error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Publish article with automatic syndication
 * Combines article publication + social sync + platform syndication
 * This is the main entry point for article publishing
 */
export async function publishArticleWithFullDistribution(
  broadcast: Broadcast,
  syndicateToPlatforms?: string[]
): Promise<{
  success: boolean;
  message: string;
  syndication?: {
    syndicatedPlatforms: string[];
    failedPlatforms: string[];
  };
}> {
  try {
    // Validate article data
    if (!broadcast.title || !broadcast.slug) {
      throw new Error("Article must have title and slug");
    }

    // Check if syndication is enabled
    const configs = await getSyndicationConfigs();
    const shouldSyndicate = configs.length > 0;

    let syndicationResult = null;

    if (shouldSyndicate) {
      // Trigger syndication without blocking article publish
      // Use Promise.allSettled to handle syndication independently
      syndicationResult = await syndicateContentAction(
        broadcast,
        syndicateToPlatforms
      );

      if (syndicationResult.syndicatedPlatforms.length > 0) {
        console.info(
          `Published to: ${syndicationResult.syndicatedPlatforms.join(", ")}`
        );
      }
    }

    return {
      success: true,
      message: `Article published successfully${
        syndicationResult?.syndicatedPlatforms.length
          ? ` and syndicated to ${syndicationResult.syndicatedPlatforms.join(", ")}`
          : ""
      }`,
      syndication: syndicationResult
        ? {
            syndicatedPlatforms: syndicationResult.syndicatedPlatforms,
            failedPlatforms: syndicationResult.failedPlatforms,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Article publication failed:", error);
    throw error;
  }
}

/**
 * Manually trigger re-syndication for existing content
 * Useful for retry or manual distribution control
 */
export async function resyndicateContentAction(
  contentId: string,
  platforms: string[]
): Promise<{
  success: boolean;
  message: string;
  syndicatedPlatforms: string[];
  failedPlatforms: string[];
}> {
  try {
    // Get article from database
    const { createServerSupabaseClient } = await import(
      "@/infrastructure/database/server"
    );
    const supabase = createServerSupabaseClient();

    const { data: broadcast, error } = await supabase
      .from("broadcasts")
      .select("*")
      .eq("id", contentId)
      .eq("content_type", "ARTICLE")
      .single();

    if (error || !broadcast) {
      throw new Error("Article not found");
    }

    // Trigger syndication
    const result = await syndicateContentAction(broadcast, platforms);

    return {
      success: result.success,
      message: result.success
        ? `Re-syndicated to ${result.syndicatedPlatforms.length} platforms`
        : `Re-syndication partially failed: ${result.failedPlatforms.length} platforms failed`,
      syndicatedPlatforms: result.syndicatedPlatforms,
      failedPlatforms: result.failedPlatforms,
    };
  } catch (error) {
    console.error("Re-syndication failed:", error);
    throw error;
  }
}
