-- Add VOLUNTEER as a valid employment_type so unpaid/volunteer roles can be
-- recorded in experiences without misrepresenting them as paid employment.
-- Kept as its own migration: Postgres does not allow a newly added enum
-- value to be referenced in the same transaction it was created in.
ALTER TYPE employment_type_enum ADD VALUE IF NOT EXISTS 'VOLUNTEER';
