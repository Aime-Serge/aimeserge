# Get the site on Google

The site is already built for Google:
- **One address only.** Each page tells Google its one real address (`https://aimeserge.vercel.app/…`), and Vercel preview copies and per-deployment addresses are marked "noindex". Google lists only the main site.
- **Its own title and description.** Every project, paper and article page has its own title, description and preview picture. Projects get a generated preview image, so links shared on LinkedIn, WhatsApp or X show a card.
- **A full page list.** `/sitemap.xml` lists every public page, including new projects, papers and articles as soon as you add them in the admin.
- **Admin pages stay private.** `/robots.txt` keeps `/admin`, `/login` and `/api` out of search results.
- **Descriptions you can edit.** Change them in **Admin → Site settings**.

What you need to do is tell Google the site is yours, once.

## 1. Verify the site (5 minutes)

1. Open <https://search.google.com/search-console> and sign in with your Google account.
2. Choose **Add property → URL prefix**, and enter `https://aimeserge.vercel.app`.
3. Choose the **HTML tag** method. Google shows something like:
   `<meta name="google-site-verification" content="AbC123…" />`
4. Go to **Admin → Site settings → Google Search Console**. Paste the tag (or just the code), then press **Save settings**.

   *No database yet?* Add `GOOGLE_SITE_VERIFICATION` = the code in Vercel → Settings → Environment Variables, and redeploy.
5. Wait a minute, then press **Verify** in Search Console.

## 2. Submit the page list

In Search Console go to **Sitemaps**, enter `sitemap.xml` and press **Submit**.

## 3. Ask Google to visit your main pages now

In Search Console, paste each address into the search bar at the top, then press **Request indexing**:
- `https://aimeserge.vercel.app/`
- `https://aimeserge.vercel.app/projects`
- `https://aimeserge.vercel.app/research`
- `https://aimeserge.vercel.app/resume`

New pages usually appear in Google within a few days to two weeks. Search `site:aimeserge.vercel.app` to see what's listed.

## Helping people find you

- **Link to your site everywhere.** Put `https://aimeserge.vercel.app` on LinkedIn (Contact info and Featured), GitHub (profile and each repository's website field), X and Instagram. Links from your own profiles are the strongest signal that the site is yours.
- **Write in plain words people search for.** "Aime Serge Ukobizaba", "INEZA AI", "DukaAI", "fire safety monitoring Rwanda".
- **Keep each project's one-line description specific.** It becomes the text under the link in Google.
- **Publish now and then.** New articles and projects give Google a reason to come back.
- **Optional: your own domain** (for example `aimeserge.com`). It's easier to remember and to rank. If you add one in Vercel, set `NEXT_PUBLIC_SITE_URL` to it, redeploy, and add the new address in Search Console. Every page and the sitemap switch to it automatically.

## Check it's working

| Check | Where |
|---|---|
| Page is indexed | Search Console → URL inspection |
| Errors or excluded pages | Search Console → Pages |
| How a link preview looks | <https://www.opengraph.xyz> (paste a project address) |
| Structured data is read | <https://search.google.com/test/rich-results> |
