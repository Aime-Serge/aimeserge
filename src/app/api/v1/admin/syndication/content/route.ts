import { NextRequest, NextResponse } from "next/server";
import {
  getArticlesForSyndication,
  getSyndicationStatusForContent,
} from "@/core/domain/portfolio/syndication-content-queries";
import { requireAdminApi } from "@/core/domain/admin/guard";

/**
 * GET /api/v1/admin/syndication/content
 * Fetches articles available for syndication with their current status
 */
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 100);

    // Fetch articles
    const articles = await getArticlesForSyndication(limit);

    // Fetch syndication status for each article
    const contentWithStatus = await Promise.all(
      articles.map(async (article) => {
        const status = await getSyndicationStatusForContent(article.id);
        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          type: "ARTICLE",
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          syndicationStatus: status,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: contentWithStatus.length,
      content: contentWithStatus,
    });
  } catch (error) {
    console.error("Get syndication content error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
