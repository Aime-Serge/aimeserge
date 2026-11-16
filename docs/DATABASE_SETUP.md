# Connect the database and the admin

About 20 minutes. When you finish, everything you change in `/admin` shows on the live site within seconds.

Until then, the site shows content written into the code. Visitors see a complete site either way, but the admin can't sign in or save.

You never need to paste a key into a chat, a commit or a file other than `.env.local`, which is never uploaded.

## 1. Collect the values (Supabase)

Open your Supabase project, **aitsisvpucplrlwtxglt**.

| Value | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key (secret: server only) |
| Database connection string | Project Settings → Database → Connection string → **Session pooler** (used once in step 3, not saved) |

Make two more yourself:

| Value | How |
|---|---|
| `JWT_SECRET` | Run `openssl rand -base64 48` |
| `CRON_SECRET` | Run `openssl rand -base64 32`. Also add it as a GitHub secret named `CRON_SECRET` (repo → Settings → Secrets → Actions) |

You also need:
- `ADMIN_EMAIL`: the email you'll sign in with.
- `GEMINI_API_KEY`: from Google AI Studio.
- `NEXT_PUBLIC_SITE_URL`: `https://aimeserge.vercel.app`.

## 2. Create your admin sign-in

In Supabase, go to **Authentication → Users → Add user → Create new user**:
- Email: the same as `ADMIN_EMAIL`.
- Password: a strong one. This is what you'll type at `/admin`.
- Tick **Auto confirm user**.

## 3. Fill the database

Run this once in the project folder, replacing the connection string:

```bash
DATABASE_URL='postgresql://postgres.aitsisvpucplrlwtxglt:<password>@<host>:5432/postgres' \
  npm run db:migrate
```

If it says the database looks new and empty, run it again with `--all`:

```bash
DATABASE_URL='…' bash scripts/apply-db-migrations.sh --all
```

What the script does:
- **Backs up the database first.** The backup goes in `backups/`. Keep it private: it contains contact messages.
- **Applies only the updates the database hasn't had yet,** so running it again later is safe and never undoes your admin edits.
- **Fills the database with exactly what the live site shows today:** projects, experience, education, certificates, awards and the homepage intro. Connecting it changes nothing visitors see.

## 4. Check everything on your computer

Copy `.env.example` to `.env.local` and fill in the values from step 1. Then run:

```bash
npm run check:setup -- --write-test
```

It checks, in plain words:
- every setting;
- the database connection and how many entries each section has;
- that visitors can't read messages, drafts or hidden projects;
- search, file uploads and your admin account.

With `--write-test` it also adds, edits and deletes a temporary entry, to prove the admin can write. Fix anything marked ✗; it tells you how.

## 5. Add the values to Vercel

Vercel → your project → **Settings → Environment Variables**. Add each value from step 1, except the database connection string, for **Production**. Then use **Deployments → ⋯ → Redeploy**.

## 6. Confirm the live site

```bash
npm run check:setup -- --site https://aimeserge.vercel.app
```

Or open <https://aimeserge.vercel.app/api/v1/health>. You should see `"database":"connected"` and `"content":"database"`.

Then sign in at `/admin`. The **Overview** shows every section as **Managed here**.

## Troubleshooting

| You see | Do |
|---|---|
| `"database":"not_configured"` | The Vercel variables are missing or weren't saved for Production. Add them and redeploy |
| `"database":"unreachable"` | The values in Vercel don't match Supabase. Copy them again and redeploy |
| "Email or password is incorrect" at `/admin` | The Supabase user (step 2) must use exactly the `ADMIN_EMAIL` address |
| "Sign-in is not configured on the server" | `ADMIN_EMAIL` or `JWT_SECRET` is missing in Vercel |
| An edit doesn't appear | Admin → Overview → **Refresh live site** |
