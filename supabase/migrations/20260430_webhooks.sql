-- Migration: Global Database Webhooks for Total Observability
-- Date: 2026-04-30

-- 1. Ensure HTTP extension is enabled
CREATE EXTENSION IF NOT EXISTS http;

-- 2. Enhanced Notification Function
-- This function sends a POST request to our Next.js API route for any change
CREATE OR REPLACE FUNCTION notify_admin_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  webhook_url TEXT;
  webhook_secret TEXT;
BEGIN
  -- Retrieve settings (Ensure these are set in Supabase dashboard or via SQL)
  -- Use coalesce for defaults if settings are not found (replace with your local dev URL if needed)
  webhook_url := current_setting('app.settings.url', true);
  webhook_secret := current_setting('app.settings.webhook_secret', true);

  IF webhook_url IS NULL OR webhook_secret IS NULL THEN
    -- Fallback to hardcoded for local development if needed, but prefer settings
    RAISE WARNING 'Webhook URL or Secret not set. Skipping notification.';
    RETURN NEW;
  END IF;

  payload := json_build_object(
    'table', TG_TABLE_NAME,
    'type', TG_OP,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
  );

  PERFORM
    http_post(
      webhook_url || '/api/webhooks/database',
      payload::text,
      'application/json',
      json_build_object('x-supabase-webhook-secret', webhook_secret)::text
    );
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Triggers to ALL critical tables
-- Contacts
DROP TRIGGER IF EXISTS tr_contact_notification ON contacts;
CREATE TRIGGER tr_contact_notification
  AFTER INSERT OR UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION notify_admin_on_transaction();

-- Security Logs
DROP TRIGGER IF EXISTS tr_security_notification ON security_logs;
CREATE TRIGGER tr_security_notification
  AFTER INSERT ON security_logs
  FOR EACH ROW 
  WHEN (NEW.severity IN ('WARN', 'CRITICAL'))
  EXECUTE FUNCTION notify_admin_on_transaction();

-- Projects
DROP TRIGGER IF EXISTS tr_project_notification ON projects;
CREATE TRIGGER tr_project_notification
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION notify_admin_on_transaction();

-- Research
DROP TRIGGER IF EXISTS tr_research_notification ON research;
CREATE TRIGGER tr_research_notification
  AFTER INSERT OR UPDATE OR DELETE ON research
  FOR EACH ROW EXECUTE FUNCTION notify_admin_on_transaction();

-- Broadcasts (Blog)
DROP TRIGGER IF EXISTS tr_broadcast_notification ON broadcasts;
CREATE TRIGGER tr_broadcast_notification
  AFTER INSERT OR UPDATE OR DELETE ON broadcasts
  FOR EACH ROW EXECUTE FUNCTION notify_admin_on_transaction();

-- Certificates
DROP TRIGGER IF EXISTS tr_certificate_notification ON certificates;
CREATE TRIGGER tr_certificate_notification
  AFTER INSERT OR UPDATE OR DELETE ON certificates
  FOR EACH ROW EXECUTE FUNCTION notify_admin_on_transaction();
