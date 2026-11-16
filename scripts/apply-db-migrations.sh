#!/usr/bin/env bash
# Back up the production database, then apply the database updates it hasn't had yet.
#
# Usage (the connection string never needs to be saved in a file):
#   DATABASE_URL='postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres' \
#     bash scripts/apply-db-migrations.sh          # existing database: November 2026 updates onward
#   ... bash scripts/apply-db-migrations.sh --all  # brand-new, empty database: every update from the start
#
# Get the URI from Supabase → Project Settings → Database → Connection string → "Session pooler".
#
# Each update runs once: applied files are recorded in public.applied_migrations,
# so running this again later never undoes changes made in the admin.
set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL first (see the header of this script).}"
cd "$(dirname "$0")/.."

ALL=false
[[ "${1:-}" == "--all" ]] && ALL=true

FIRST="20261109120000" # first update of the November 2026 work
BASE_TABLES="projects research certificates contacts articles posts broadcasts experiences educations organizations achievements knowledge"

q() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc "$1"; }

echo "1/5 Backing up…"
mkdir -p backups
backup="backups/db-$(date +%Y%m%d-%H%M%S).sql"
pg_dump "$DATABASE_URL" --no-owner --no-privileges --schema=public -f "$backup"
echo "    saved $backup ($(du -h "$backup" | cut -f1)). Keep it private: it contains contact messages."

echo "2/5 Checking the base schema…"
missing=""
for t in $BASE_TABLES; do
  [ "$(q "select to_regclass('public.$t') is not null")" = "t" ] || missing="$missing $t"
done
if [ -n "$missing" ] && ! $ALL; then
  echo "    Missing tables:$missing"
  if [ "$(echo $missing | wc -w)" -ge 10 ]; then
    echo "    This looks like a new, empty database. Run again with --all to set it up from the start."
  else
    echo "    This database never received some earlier updates. Share this output before going further."
  fi
  echo "    Nothing was changed."
  exit 1
fi

echo "3/5 Preparing the update log…"
q "create table if not exists public.applied_migrations (filename text primary key, applied_at timestamptz not null default now())"
q "alter table public.applied_migrations enable row level security" # no policies: visitors can't read it

echo "4/5 Applying updates…"
applied=0
for f in $(ls supabase/migrations/*.sql | sort); do
  name="$(basename "$f")"
  if ! $ALL && [[ ! "$name" > "$FIRST" && "$name" != "$FIRST"* ]]; then continue; fi
  [ "$(q "select count(*) from public.applied_migrations where filename = '$name'")" = "1" ] && continue
  echo "    → $name"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -q \
    -c "\\i $f" \
    -c "insert into public.applied_migrations (filename) values ('$name')" >/dev/null
  applied=$((applied + 1))
done
[ "$applied" -eq 0 ] && echo "    Nothing new: the database is up to date."

echo "5/5 Verifying…"
psql "$DATABASE_URL" -At <<'SQL' | sed 's/^/    /'
select 'RLS on contacts: '  || relrowsecurity from pg_class where oid = 'public.contacts'::regclass;
select 'RLS on knowledge: ' || relrowsecurity from pg_class where oid = 'public.knowledge'::regclass;
select 'profile row: '      || count(*) from public.profile;
select 'visible projects: ' || count(*) from public.projects where is_visible;
select 'roles / education / certificates / awards: ' || (select count(*) from public.experiences) || ' / ' || (select count(*) from public.educations) || ' / ' || (select count(*) from public.certificates) || ' / ' || (select count(*) from public.achievements);
select 'upload storage ready: ' || coalesce((select public::text from storage.buckets where id = 'artifacts'), 'missing');
select 'search works: '     || (count(*) >= 0) from public.search_site('software', 5);
SQL
echo "Done. Next: npm run check:setup -- --write-test"
