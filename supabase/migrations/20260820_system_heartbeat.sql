-- Keep a single operational heartbeat row without adding data to portfolio tables.
CREATE TABLE IF NOT EXISTS public.system_heartbeat (
    id TEXT PRIMARY KEY DEFAULT 'daily',
    heartbeat_count BIGINT NOT NULL DEFAULT 0,
    last_heartbeat_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.system_heartbeat ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.record_system_heartbeat()
RETURNS public.system_heartbeat
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    heartbeat public.system_heartbeat;
BEGIN
    INSERT INTO public.system_heartbeat (id, heartbeat_count, last_heartbeat_at)
    VALUES ('daily', 1, now())
    ON CONFLICT (id) DO UPDATE
    SET heartbeat_count = public.system_heartbeat.heartbeat_count + 1,
        last_heartbeat_at = now()
    RETURNING * INTO heartbeat;

    RETURN heartbeat;
END;
$$;

REVOKE ALL ON FUNCTION public.record_system_heartbeat() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_system_heartbeat() TO service_role;