/**
 * Finalized Supabase Storage Utility
 * Provides cloud-native asset resolution with intelligent fallbacks and transformations.
 */

const SUPABASE_URL = "https://kzyqiadzetzprwetyebm.supabase.co";
const BUCKET_NAME = "artifacts";

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
}

/**
 * Resolves a storage path to a public URL with optional transformations
 */
export function getAssetUrl(path: string | null | undefined, options?: ImageOptions): string {
  if (!path) return "";
  
  // If it's already a full URL, return it
  if (path.startsWith("http")) return path;

  const cleanPath = path.replace(/^\//, '');
  
  // Base URL
  let url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;

  // Image transformations (if options provided and it's likely an image)
  if (options && (cleanPath.match(/\.(jpg|jpeg|png|webp|avif)$/i))) {
    const params = new URLSearchParams();
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    
    // Note: Supabase uses a different URL structure for transformations:
    // /storage/v1/render/image/public/[bucket]/[path]?[params]
    url = `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET_NAME}/${cleanPath}?${params.toString()}`;
  }

  return url;
}
