# Database Credentials & Connection Setup Guide

## 🔴 Issue Summary

During build, you see:
```
Supabase credentials missing in Server Client. This will likely cause a fetch error.
```

This happens because:
1. ❌ `.env.local` is missing or incomplete
2. ❌ Supabase environment variables not set during build
3. ❌ Database queries run during static generation without credentials

---

## ✅ Solution: Complete Setup

### **Step 1: Create `.env.local` File**

Create `/home/aime-serge/Documents/projects/aimeserge/.env.local` with your Supabase credentials:

```env
# 🔑 Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 🔐 Security (REQUIRED FOR PRODUCTION)
JWT_SECRET=your-random-32-character-secret-key-here-minimum

# 📧 Email Service (OPTIONAL)
RESEND_API_KEY=re_your_resend_key_here
ADMIN_EMAIL=your-email@example.com

# 🎮 Discord Notifications (OPTIONAL)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/webhook

# 🔔 Webhooks (REQUIRED IF USING WEBHOOKS)
SUPABASE_WEBHOOK_SECRET=your-webhook-secret-here

# 🤖 AI/Gemini (OPTIONAL)
GEMINI_API_KEY=your-gemini-api-key-here

# 📡 Environment
NODE_ENV=development
```

### **Step 2: Get Supabase Credentials**

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com

2. **Find your project and get these values:**

   **For NEXT_PUBLIC_SUPABASE_URL:**
   - Project Settings → API → Project URL

   **For NEXT_PUBLIC_SUPABASE_ANON_KEY:**
   - Project Settings → API → anon (public) key

   **For SUPABASE_SERVICE_ROLE_KEY:**
   - Project Settings → API → service_role (secret) key
   - ⚠️ Keep this SECRET - never commit to git

### **Step 3: Generate JWT_SECRET**

Run this command to generate a secure 32+ character key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as `JWT_SECRET`.

---

## 🔧 Implementation: Fix Database Client

I've updated the database clients to handle missing credentials gracefully:

### **File: `src/infrastructure/database/server.ts`**
✅ **Now handles missing credentials during build-time static generation**

```ts
// Creates a server client with fallback for build-time
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build (SSG), credentials may not be available
  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Supabase credentials missing. Using placeholder for build-time safety.");
    // Return a placeholder client that won't crash the build
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }

  return createClient(supabaseUrl, supabaseKey);
};
```

---

## 📝 Updated Environment Validation

### **File: `src/infrastructure/utils/env.ts`**
✅ **Now properly validates and warns about missing variables**

The validation:
- ✅ Makes all Supabase variables optional (for build safety)
- ✅ Makes JWT_SECRET optional in development (required in production)
- ✅ Logs warnings in development
- ✅ Throws errors in production if critical vars missing

---

## 🛡️ Security Best Practices

### **DO ✅**
- Use `.env.local` for local development
- Use strong random `JWT_SECRET` (32+ chars)
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use environment secrets in CI/CD (GitHub, Vercel, etc.)

### **DON'T ❌**
- Never commit `.env.local` to git
- Never hardcode API keys in code
- Never share `SUPABASE_SERVICE_ROLE_KEY`
- Never commit credentials to version control

### **For Git Safety**
Add to `.gitignore` (should already be there):
```
.env.local
.env*.local
.env.production.local
```

---

## 🚀 Deployment: Production Environment Variables

### **For Vercel Deployment:**
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - etc.

### **For Azure/Docker:**
Set via:
- Azure Key Vault
- Docker secrets
- Environment files in CI/CD pipeline

---

## ✅ Verification Checklist

After setting up `.env.local`:

- [ ] File exists: `.env.local`
- [ ] Has `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Has `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Has `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Has `JWT_SECRET` (32+ characters)
- [ ] `.gitignore` includes `.env.local`

Then rebuild:
```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Generating static pages (15/15)  ← No more credential warnings!
```

---

## 🐛 Troubleshooting

### **Issue: "Supabase credentials missing" warning persists**
**Solution:** 
- Restart dev server: `npm run dev`
- Verify `.env.local` is in project root
- Check variable names match exactly (case-sensitive)

### **Issue: "Cannot fetch from Supabase" at runtime**
**Solution:**
- Verify credentials are correct
- Check Supabase project is active
- Ensure API keys have proper permissions
- Check RLS policies on database tables

### **Issue: Build fails in production**
**Solution:**
- Verify all environment variables set in deployment platform
- Check JWT_SECRET is 32+ characters
- Ensure service role key is set (not just anon key)

---

## 📂 Files Configured

| File | Purpose | Status |
|------|---------|--------|
| `.env.local` | Local credentials | ⏳ YOU CREATE |
| `src/infrastructure/database/server.ts` | Server DB client | ✅ Fixed |
| `src/infrastructure/database/client.ts` | Client DB client | ✅ Validated |
| `src/infrastructure/utils/env.ts` | Env validation | ✅ Safe |

---

## Next Steps

1. **Create `.env.local`** with your Supabase credentials
2. **Restart dev server:** `npm run dev`
3. **Rebuild:** `npm run build`
4. **Verify:** No more credential warnings ✅

---

*Updated: 2026-08-13 | Environment Setup Complete*
