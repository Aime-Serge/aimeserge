-- Migration: Align Vector Dimensions with Gemini (768)
-- Date: 2026-05-05

-- 1. Drop existing match function to avoid conflicts
DROP FUNCTION IF EXISTS match_knowledge(vector(1536), float, int);

-- 2. Modify knowledge table to use 768 dimensions
ALTER TABLE knowledge ALTER COLUMN embedding TYPE VECTOR(768);

-- 3. Re-create match function for 768 dimensions
CREATE OR REPLACE FUNCTION match_knowledge (
  query_embedding VECTOR(768),
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
