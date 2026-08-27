-- Achievements table: awards/recognitions from the resume's "ACHIEVEMENTS"
-- section that don't fit experiences/educations/certificates.
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    issuer TEXT,
    achieved_date TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public achievements are viewable" ON public.achievements FOR SELECT USING (true);

INSERT INTO public.achievements (title, issuer)
VALUES ('4th Place, Innovate With Google Cloud Hackathon', 'Google Cloud');
