-- Baseline tables required by the versioned portfolio migrations.
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    role TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    tools TEXT[] NOT NULL,
    features TEXT[] NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('AI', 'Security', 'Cloud', 'Full-Stack', 'Software Engineering')),
    url TEXT,
    pdf_url TEXT,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    is_current BOOLEAN DEFAULT FALSE,
    start_date JSONB,
    end_date JSONB,
    contributors TEXT[] DEFAULT '{}',
    association TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.broadcasts (
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

CREATE TABLE IF NOT EXISTS public.research (
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

CREATE TABLE IF NOT EXISTS public.certificates (
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

CREATE TABLE IF NOT EXISTS public.contacts (
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

CREATE EXTENSION IF NOT EXISTS vector;