import { NextRequest, NextResponse } from "next/server";
import { ContentSyndicationService } from "@/core/application/services/SyndicationService";
import {
  getSyndicationConfigs,
  recordSyndication,
} from "@/core/domain/portfolio/syndication-queries";
import { requireAdminApi } from "@/core/domain/admin/guard";

/**
 * POST /api/v1/admin/syndicate
 * Publishes content to multiple syndication platforms
 */

export async function POST(request: NextRequest) {
  try {
    // Verify admin session (signed, httpOnly auth_token cookie)
    const denied = await requireAdminApi();
    if (denied) return denied;

    const { contentId, contentType, content, platforms } = await request.json();

    if (!contentId) {
      return NextResponse.json(
        { error: "Missing required field: contentId" },
        { status: 400 }
      );
    }

    // The dashboard sends only an ID: load the stored article and syndicate it.
    if (!content) {
      if (!Array.isArray(platforms) || platforms.length === 0) {
        return NextResponse.json({ error: "Choose at least one platform" }, { status: 400 });
      }
      const { resyndicateContentAction } = await import("@/core/domain/portfolio/syndication-actions");
      const result = await resyndicateContentAction(String(contentId), platforms.map(String));
      return NextResponse.json({ contentId, ...result }, { status: result.success ? 200 : 207 });
    }

    // Load syndication configs
    const configs = await getSyndicationConfigs();

    // Initialize syndication service
    const syndicationService = new ContentSyndicationService(configs);

    // Filter to requested platforms
    const targetPlatforms = platforms || Array.from(
      configs
        .filter((c) => c.enabled)
        .map((c) => c.platform as any)
    );

    if (targetPlatforms.length === 0) {
      return NextResponse.json(
        { error: "No syndication platforms configured" },
        { status: 400 }
      );
    }

    // Publish to all platforms
    const results = await syndicationService.publishToAll(content, targetPlatforms);

    // Record results in database
    const recordedResults = [];
    for (const [platform, result] of results.entries()) {
      const recorded = await recordSyndication(
        contentId,
        contentType || "ARTICLE",
        platform as string,
        result
      );
      recordedResults.push({
        platform,
        ...result,
        id: recorded?.id,
      });
    }

    // Check if all succeeded
    const allSucceeded = Array.from(results.values()).every((r) => r.success);

    return NextResponse.json({
      success: allSucceeded,
      contentId,
      platforms: recordedResults,
      message: allSucceeded
        ? `Successfully published to ${results.size} platform(s)`
        : `Partially published: ${Array.from(results.values()).filter((r) => r.success).length}/${results.size} succeeded`,
    });
  } catch (error) {
    console.error("Syndication API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/admin/syndicate/:contentId
 * Fetches syndication status for a piece of content
 */

export async function GET(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json(
        { error: "Missing contentId parameter" },
        { status: 400 }
      );
    }

    const { getSyndicationStatus } = await import(
      "@/core/domain/portfolio/syndication-queries"
    );
    const status = await getSyndicationStatus(contentId);

    return NextResponse.json({
      contentId,
      syndicationCount: status.length,
      platforms: status,
    });
  } catch (error) {
    console.error("Get syndication status error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
