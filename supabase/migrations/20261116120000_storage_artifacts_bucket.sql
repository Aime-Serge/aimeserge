-- Storage bucket for admin uploads (certificate PDFs, CVs, project images).
-- The admin uploads with the service role, which bypasses storage policies;
-- the bucket is public so visitors can open the uploaded files by URL.
-- Safe to run more than once.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artifacts', 'artifacts', TRUE,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
