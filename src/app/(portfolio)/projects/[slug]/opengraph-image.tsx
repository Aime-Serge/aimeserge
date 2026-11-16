import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/core/domain/portfolio/queries";
import { SITE } from "@/config/site";

/**
 * Link-preview picture for each project (LinkedIn, WhatsApp, X, Google).
 * Generated from the project's own text, so new projects added in the admin
 * get one automatically. SVG thumbnails can't be used: most apps ignore them.
 */
export const alt = "Project by Aime Serge Ukobizaba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const title = project?.title ?? "Projects";
  const tagline = project?.tagline ?? SITE.description;
  const category = project?.category ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "72px", background: "linear-gradient(135deg, #020617 0%, #0b2533 60%, #0e7490 100%)", color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#67e8f9", letterSpacing: 2, textTransform: "uppercase" }}>{category}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          <div style={{ fontSize: 34, color: "#cbd5e1", lineHeight: 1.35, maxWidth: 1000 }}>
            {tagline.length > 150 ? `${tagline.slice(0, 147)}…` : tagline}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#94a3b8" }}>
          <span>{SITE.name}</span>
          <span>{new URL(SITE.url).host}</span>
        </div>
      </div>
    ),
    size,
  );
}
