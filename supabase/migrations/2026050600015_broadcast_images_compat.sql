-- Preserve the legacy broadcast image column expected by the LinkedIn upgrade.
ALTER TABLE public.broadcasts
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

UPDATE public.broadcasts
SET images = image_urls
WHERE images = '{}' AND image_urls IS NOT NULL;