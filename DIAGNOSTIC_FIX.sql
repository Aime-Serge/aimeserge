-- DIAGNOSTIC_FIX.sql
-- Run this in your Supabase SQL Editor to resolve "System failure during transmission" issues.

-- 1. Ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Repair Contacts Table (Ensure all columns exist for the current form)
DO $$ 
BEGIN 
    -- Basic Newsletter column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='newsletter_opt_in') THEN
        ALTER TABLE contacts ADD COLUMN newsletter_opt_in BOOLEAN DEFAULT FALSE;
    END IF;

    -- Demographics columns (Gender/Marital)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='gender') THEN
        ALTER TABLE contacts ADD COLUMN gender TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='marital_status') THEN
        ALTER TABLE contacts ADD COLUMN marital_status TEXT;
    END IF;

    -- LinkedIn & WhatsApp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='linkedin_url') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='whatsapp') THEN
        ALTER TABLE contacts ADD COLUMN whatsapp TEXT;
    END IF;

    -- Business/Project columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='company_name') THEN
        ALTER TABLE contacts ADD COLUMN company_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='job_title') THEN
        ALTER TABLE contacts ADD COLUMN job_title TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='budget') THEN
        ALTER TABLE contacts ADD COLUMN budget TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='timeline') THEN
        ALTER TABLE contacts ADD COLUMN timeline TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='location') THEN
        ALTER TABLE contacts ADD COLUMN location TEXT;
    END IF;
END $$;

-- 3. Ensure Security Logs table exists for Audit Shield
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

-- 4. Enable RLS and setup Policies for security_logs
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent "already exists" errors
DROP POLICY IF EXISTS "Enable insert for all users" ON security_logs;
DROP POLICY IF EXISTS "Enable select for admin" ON security_logs;

-- Recreate policies
CREATE POLICY "Enable insert for all users" ON security_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for admin" ON security_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Also ensure contacts table has public insert policy
DROP POLICY IF EXISTS "Public Submit Inquiry" ON contacts;
CREATE POLICY "Public Submit Inquiry" ON contacts FOR INSERT WITH CHECK (true);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 5. Repair Knowledge table for RAG
CREATE TABLE IF NOT EXISTS knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536)
);

-- 6. Storage Policies (Run these to ensure buckets exist and are accessible)
-- This creates the buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artifacts', 'artifacts', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true) 
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to prevent conflicts
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Full Access" ON storage.objects;

-- Create storage policies
-- 1. Allow public read access to all objects in these buckets
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id IN ('artifacts', 'resumes'));

-- 2. Allow all operations (Insert/Update/Delete) for authenticated users
CREATE POLICY "Admin Full Access" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id IN ('artifacts', 'resumes'))
WITH CHECK (bucket_id IN ('artifacts', 'resumes'));

DO $$
BEGIN
  RAISE NOTICE 'Database diagnostic repair completed. Storage buckets and policies are now synchronized.';
END $$;
