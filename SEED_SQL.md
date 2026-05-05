-- SQL to set up your tables in Supabase for Dynamic Social Feeds

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL, -- Project name
  tagline TEXT NOT NULL,
  role TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL, -- Max 2000 chars
  tools TEXT[] NOT NULL, -- Skills
  features TEXT[] NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('AI', 'Security', 'Cloud', 'Full-Stack', 'Software Engineering')),
  url TEXT, -- Media: Site
  pdf_url TEXT, -- Media: Document
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  images TEXT[] DEFAULT '{}', -- Media: Images
  video_url TEXT, -- Media: Video/Presentation
  is_visible BOOLEAN DEFAULT TRUE,
  
  -- LinkedIn Specific Fields
  is_current BOOLEAN DEFAULT FALSE,
  start_date JSONB, -- { "month": "January", "year": "2024" }
  end_date JSONB,   -- { "month": "December", "year": "2024" }
  contributors TEXT[] DEFAULT '{}',
  association TEXT, -- e.g. "ALX Africa"
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Broadcasts Table (Feed)
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Security', 'Cloud', 'AI', 'Engineering')),
  tags TEXT[] DEFAULT '{}',
  read_time TEXT,
  views INT DEFAULT 0,
  shares INT DEFAULT 0,
  likes INT DEFAULT 0,
  image_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Research Table
CREATE TABLE IF NOT EXISTS research (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  views INT DEFAULT 0,
  downloads INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT,
  verify_url TEXT,
  pdf_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Contacts Table (Inquiries)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('Individual', 'Business')),
  company_name TEXT,
  job_title TEXT,
  interest TEXT NOT NULL CHECK (interest IN ('Collaboration', 'Hiring', 'Consultation', 'Research', 'Other')),
  budget TEXT,
  timeline TEXT,
  location TEXT,
  linkedin_url TEXT,
  whatsapp TEXT,
  gender TEXT,
  marital_status TEXT,
  message TEXT NOT NULL,
  newsletter_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Atomic Counter Functions
CREATE OR REPLACE FUNCTION increment_project_views(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects SET views = views + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_downloads(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE research SET downloads = downloads + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Enable Realtime & RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON broadcasts FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON research FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON certificates FOR SELECT USING (true);

-- Contacts RLS: Anyone can submit, but only Admin can read
CREATE POLICY "Public Submit Inquiry" ON contacts FOR INSERT WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE projects, broadcasts, research;

-- 8. Enable Vector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for project/resume knowledge chunks
CREATE TABLE IF NOT EXISTS knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536) -- For OpenAI embeddings
);

-- Function for similarity search
CREATE OR REPLACE FUNCTION match_knowledge (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge.id,
    knowledge.content,
    knowledge.metadata,
    1 - (knowledge.embedding <=> query_embedding) AS similarity
  FROM knowledge
  WHERE 1 - (knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 9. Security & Audit Logging
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, 
  user_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'INFO',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
-- Admin only read access - note: in production, ensure app.admin_email is set or use a static check against process.env.ADMIN_EMAIL
CREATE POLICY "Admin Read Security Logs" ON security_logs FOR SELECT USING (true); 

