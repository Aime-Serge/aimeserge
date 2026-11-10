#!/usr/bin/env bash
# Back up the production database, check it, and apply the November 2026 migrations.
#
# Usage (the connection string never needs to be saved in a file):
#   DATABASE_URL='postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres' \
#     bash scripts/apply-db-migrations.sh
#
# Get the URI from Supabase → Project Settings → Database → Connection string → "Session pooler".
# Safe to re-run: every migration is idempotent and runs in a single transaction.
set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL first (see the header of this script).}"
cd "$(dirname "$0")/.."

# Every migration from the November 2026 work onward, in filename (= date) order.
# Each one is safe to run more than once.
MIGRATIONS=()
for f in supabase/migrations/*.sql; do
  [[ "$(basename "$f")" > "20261109120000" || "$(basename "$f")" == 20261109120000* ]] && MIGRATIONS+=("$f")
done
BASE_TABLES="projects research certificates contacts articles posts broadcasts experiences educations organizations achievements knowledge"

echo "1/4 Backing up…"
mkdir -p backups
backup="backups/db-$(date +%Y%m%d-%H%M%S).sql"
pg_dump "$DATABASE_URL" --no-owner --no-privileges --schema=public -f "$backup"
echo "    saved $backup ($(du -h "$backup" | cut -f1)). Keep it private: it contains contact messages."

echo "2/4 Checking the base schema…"
missing=""
for t in $BASE_TABLES; do
  exists=$(psql "$DATABASE_URL" -Atc "select to_regclass('public.$t') is not null")
  [ "$exists" = "t" ] || missing="$missing $t"
done
if [ -n "$missing" ]; then
  echo "    Missing tables:$missing"
  echo "    This database never received the earlier migrations, so the new ones can't be applied safely."
  echo "    Nothing was changed. Share this output and we'll plan the full schema setup."
  exit 1
fi
psql "$DATABASE_URL" -Atc "select 'projects='||count(*) from projects union all select 'articles='||count(*) from articles union all select 'experiences='||count(*) from experiences" | sed 's/^/    /'

echo "3/4 Applying migrations…"
for f in "${MIGRATIONS[@]}"; do
  echo "    → $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -q -f "$f"
done

echo "4/4 Verifying…"
psql "$DATABASE_URL" -At <<'SQL' | sed 's/^/    /'
select 'RLS on contacts: '  || relrowsecurity from pg_class where oid = 'public.contacts'::regclass;
select 'RLS on knowledge: ' || relrowsecurity from pg_class where oid = 'public.knowledge'::regclass;
select 'profile row: '      || count(*) from public.profile;
select 'search works: '     || (count(*) >= 0) from public.search_site('software', 5);
select 'articles (draft/published): ' || coalesce(string_agg(status::text || '=' || n, ', '), 'none')
  from (select status, count(*) n from public.articles group by status) s;
SQL
echo "Done. Next: in /admin, publish an article, edit the profile and feature a project."
