-- Migration: Relational Professional Schema (LinkedIn-style)
-- Date: 2026-05-06

-- 1. Organizations Table (Companies, Schools, Issuers)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Employment Type Enum
DO $$ BEGIN
    CREATE TYPE employment_type_enum AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');
    CREATE TYPE location_type_enum AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Experiences Table
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    employment_type employment_type_enum DEFAULT 'FULL_TIME',
    location VARCHAR(255),
    location_type location_type_enum DEFAULT 'ON_SITE',
    start_date DATE NOT NULL,
    end_date DATE, -- Null if current
    description TEXT, -- Supports Markdown
    skills_used TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Educations Table
CREATE TABLE IF NOT EXISTS educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    grade VARCHAR(50),
    activities TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Refactor Certificates to use Organizations as Issuers
-- We add issuer_id and other professional fields
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS issuer_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS credential_id VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- 6. Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public organizations are viewable" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public experiences are viewable" ON experiences FOR SELECT USING (true);
CREATE POLICY "Public educations are viewable" ON educations FOR SELECT USING (true);

-- 7. Performance Indices
CREATE INDEX IF NOT EXISTS idx_exp_company ON experiences (company_id);
CREATE INDEX IF NOT EXISTS idx_edu_institution ON educations (institution_id);
CREATE INDEX IF NOT EXISTS idx_cert_issuer ON certificates (issuer_id);
