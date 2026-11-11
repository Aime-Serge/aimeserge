"use server";

/**
 * Admin actions for site health and the resume sections (experience,
 * education, achievements). Every export here is a public endpoint, so each
 * one checks the admin session first.
 */
import { z } from "zod";
import { validateAdminSession } from "./queries";
import { withShield } from "@/infrastructure/security/shield";
import { CONTENT_TABLES, revalidateContent } from "@/infrastructure/cache/content";
import type { ActionResult } from "./content-mutations";

// ─── Site health ─────────────────────────────────────────────────────────

export type SectionHealth = {
  key: string;
  label: string;
  /** Rows in the database, or null when the count failed. */
  count: number | null;
  /** What the public page shows right now. */
  source: "admin" | "built-in";
  tab: string;
};

export type SiteHealth = {
  database: { ok: boolean; message: string };
  sections: SectionHealth[];
  messagesThisWeek: number | null;
  settings: Array<{ label: string; ok: boolean; help: string }>;
};

const SECTIONS: Array<{ key: string; label: string; tab: string; filter?: [string, string] }> = [
  { key: "projects", label: "Projects & ventures", tab: "projects" },
  { key: "research", label: "Research", tab: "research" },
  { key: "articles", label: "Blog (published)", tab: "articles", filter: ["status", "PUBLISHED"] },
  { key: "experiences", label: "Experience", tab: "experiences" },
  { key: "educations", label: "Education", tab: "educations" },
  { key: "certificates", label: "Certificates", tab: "certificates" },
  { key: "achievements", label: "Awards", tab: "achievements" },
];

const has = (name: string) => Boolean(process.env[name]?.trim());

async function getSiteHealthBase(): Promise<ActionResult<SiteHealth>> {
  const db = await validateAdminSession();

  const counts = await Promise.all(
    SECTIONS.map(async (s) => {
      let q = db.from(s.key).select("id", { count: "exact", head: true });
      if (s.filter) q = q.eq(s.filter[0], s.filter[1]);
      const { count, error } = await q;
      return error ? null : count ?? 0;
    })
  );

  const profile = await db.from("profile").select("id").limit(1);
  const dbOk = !profile.error;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recent = await db.from("contacts").select("id", { count: "exact", head: true }).gte("created_at", weekAgo);

  return {
    success: true,
    message: "ok",
    data: {
      database: dbOk
        ? { ok: true, message: "Connected. Changes you save go live within seconds." }
        : {
            ok: false,
            message: /not configured/i.test(profile.error?.message || "")
              ? "The site isn't connected to its database, so it shows built-in content and admin changes can't be saved. Add the Supabase keys in Vercel (see .env.example), redeploy, then run scripts/apply-db-migrations.sh."
              : `The database didn't answer: ${profile.error?.message || "unknown error"}. Try again in a minute; if it continues, check Supabase.`,
          },
      sections: SECTIONS.map((s, i) => ({
        key: s.key,
        label: s.label,
        tab: s.tab,
        count: counts[i],
        source: counts[i] ? "admin" : "built-in",
      })),
      messagesThisWeek: recent.error ? null : recent.count ?? 0,
      settings: [
        { label: "Profile row", ok: Boolean(profile.data?.length), help: "Homepage intro and CV link. Save the Profile tab once to create it." },
        { label: "AI (Gemini) key", ok: has("GEMINI_API_KEY") || has("GOOGLE_GENERATIVE_AI_API_KEY"), help: "Needed for CV import and the site assistant. Add GEMINI_API_KEY in Vercel." },
        { label: "Automatic refresh secret", ok: has("CRON_SECRET"), help: "Lets the CV automation refresh pages. Add CRON_SECRET in Vercel and GitHub." },
        { label: "Email notifications", ok: has("RESEND_API_KEY"), help: "Optional: email when someone sends a message. Add RESEND_API_KEY in Vercel." },
      ],
    },
  };
}

const shieldedHealth = withShield("site_health", getSiteHealthBase, { limit: 30 });
export async function getSiteHealth(): Promise<ActionResult<SiteHealth>> {
  try {
    return await shieldedHealth(undefined as never);
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Couldn't check the site." };
  }
}

/** Purge every cached public page so the live site shows the latest content. */
async function refreshLiveSiteBase(): Promise<ActionResult> {
  await validateAdminSession();
  CONTENT_TABLES.forEach(revalidateContent);
  return { success: true, message: "Live site refreshed. Pages rebuild on their next visit." };
}

const shieldedRefresh = withShield("refresh_live_site", refreshLiveSiteBase, { limit: 10, auditLog: true });
export async function refreshLiveSite(): Promise<ActionResult> {
  try {
    return await shieldedRefresh(undefined as never);
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Refresh failed." };
  }
}

// ─── Resume sections ─────────────────────────────────────────────────────

export type ResumeTable = "experiences" | "educations" | "achievements";
const RESUME_TABLES = ["experiences", "educations", "achievements"] as const;

/** "2026-03" or "2026-03-15" or "2026" → a DATE string the DB accepts. */
const toDate = (v?: string | null) => {
  if (!v) return null;
  if (/^\d{4}$/.test(v)) return `${v}-01-01`;
  if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01`;
  return v;
};

const month = z.string().trim().regex(/^\d{4}(-\d{2})?(-\d{2})?$/, "Use a date like 2026-03.");
const optionalMonth = month.optional().or(z.literal("")).nullable();

const experienceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "Add the role title.").max(255),
  organization: z.string().trim().min(2, "Add the organisation.").max(255),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "VOLUNTEER"]),
  location: z.string().trim().max(255).optional().or(z.literal("")),
  startDate: month,
  endDate: optionalMonth,
  description: z.string().trim().max(4000).optional().or(z.literal("")),
});

const educationSchema = z.object({
  id: z.string().uuid().optional(),
  degree: z.string().trim().min(2, "Add the qualification.").max(255),
  institution: z.string().trim().min(2, "Add the school or programme.").max(255),
  fieldOfStudy: z.string().trim().max(255).optional().or(z.literal("")),
  startDate: optionalMonth,
  endDate: optionalMonth,
  grade: z.string().trim().max(50).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
});

const achievementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Add what you achieved.").max(300),
  issuer: z.string().trim().max(255).optional().or(z.literal("")),
  date: optionalMonth,
  url: z.string().trim().url("Link must be a full URL.").max(500).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ExperienceInput = z.input<typeof experienceSchema>;
export type EducationInput = z.input<typeof educationSchema>;
export type AchievementInput = z.input<typeof achievementSchema>;

export type ResumeRow = {
  id: string;
  title: string;
  subtitle: string;
  when: string;
  current: boolean;
  /** Values to pre-fill the editor. */
  form: Record<string, string>;
};

type Db = Awaited<ReturnType<typeof validateAdminSession>>;

async function orgId(db: Db, name: string): Promise<string> {
  const clean = name.trim();
  const { data: found } = await db.from("organizations").select("id").ilike("name", clean).limit(1);
  if (found?.length) return found[0].id as string;
  const { data, error } = await db.from("organizations").insert({ name: clean }).select("id").single();
  if (error || !data) throw new Error(`Couldn't save the organisation: ${error?.message}`);
  return data.id as string;
}

const ym = (d?: string | null) => (d ? d.slice(0, 7) : "");
const span = (a?: string | null, b?: string | null, current?: boolean) =>
  [ym(a), current ? "now" : ym(b)].filter(Boolean).join(" → ");

async function listResumeBase(table: ResumeTable): Promise<ActionResult<ResumeRow[]>> {
  const db = await validateAdminSession();
  if (!RESUME_TABLES.includes(table)) return { success: false, message: "Unknown section." };

  if (table === "experiences") {
    const { data, error } = await db
      .from("experiences")
      .select("id, title, employment_type, location, start_date, end_date, description, company:organizations(name)")
      .order("start_date", { ascending: false });
    if (error) return { success: false, message: error.message };
    return {
      success: true,
      message: "ok",
      data: (data ?? []).map((r) => {
        const org = (r.company as unknown as { name?: string } | null)?.name ?? "";
        return {
          id: r.id,
          title: r.title,
          subtitle: org,
          when: span(r.start_date, r.end_date, !r.end_date),
          current: !r.end_date,
          form: {
            id: r.id, title: r.title, organization: org, employmentType: r.employment_type ?? "FULL_TIME",
            location: r.location ?? "", startDate: ym(r.start_date), endDate: ym(r.end_date), description: r.description ?? "",
          },
        };
      }),
    };
  }

  if (table === "educations") {
    const { data, error } = await db
      .from("educations")
      .select("id, degree, field_of_study, start_date, end_date, grade, description, institution:organizations(name)")
      .order("start_date", { ascending: false, nullsFirst: false });
    if (error) return { success: false, message: error.message };
    return {
      success: true,
      message: "ok",
      data: (data ?? []).map((r) => {
        const inst = (r.institution as unknown as { name?: string } | null)?.name ?? "";
        return {
          id: r.id,
          title: r.degree,
          subtitle: [inst, r.field_of_study].filter(Boolean).join(" · "),
          when: span(r.start_date, r.end_date),
          current: false,
          form: {
            id: r.id, degree: r.degree, institution: inst, fieldOfStudy: r.field_of_study ?? "",
            startDate: ym(r.start_date), endDate: ym(r.end_date), grade: r.grade ?? "", description: r.description ?? "",
          },
        };
      }),
    };
  }

  const { data, error } = await db
    .from("achievements")
    .select("id, title, issuer, achieved_date, url, description")
    .order("achieved_date", { ascending: false, nullsFirst: false });
  if (error) return { success: false, message: error.message };
  return {
    success: true,
    message: "ok",
    data: (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      subtitle: r.issuer ?? "",
      when: r.achieved_date ?? "",
      current: false,
      form: {
        id: r.id, title: r.title, issuer: r.issuer ?? "", date: r.achieved_date ?? "",
        url: r.url ?? "", description: r.description ?? "",
      },
    })),
  };
}

const shieldedList = withShield("resume_list", listResumeBase, { limit: 60 });
export async function listResumeEntries(table: ResumeTable): Promise<ActionResult<ResumeRow[]>> {
  try {
    return await shieldedList(table);
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Couldn't load this section." };
  }
}

type SaveInput =
  | { table: "experiences"; values: ExperienceInput }
  | { table: "educations"; values: EducationInput }
  | { table: "achievements"; values: AchievementInput };

async function saveResumeBase(input: SaveInput): Promise<ActionResult> {
  const db = await validateAdminSession();
  const blank = (v?: string | null) => (v ? v : null);

  let row: Record<string, unknown>;
  let id: string | undefined;

  if (input.table === "experiences") {
    const p = experienceSchema.safeParse(input.values);
    if (!p.success) return { success: false, message: p.error.issues[0]?.message || "Check the form." };
    const v = p.data;
    id = v.id;
    row = {
      company_id: await orgId(db, v.organization),
      title: v.title,
      employment_type: v.employmentType,
      location: blank(v.location),
      start_date: toDate(v.startDate),
      end_date: toDate(v.endDate),
      description: blank(v.description),
      updated_at: new Date().toISOString(),
    };
  } else if (input.table === "educations") {
    const p = educationSchema.safeParse(input.values);
    if (!p.success) return { success: false, message: p.error.issues[0]?.message || "Check the form." };
    const v = p.data;
    id = v.id;
    row = {
      institution_id: await orgId(db, v.institution),
      degree: v.degree,
      field_of_study: blank(v.fieldOfStudy),
      start_date: toDate(v.startDate),
      end_date: toDate(v.endDate),
      grade: blank(v.grade),
      description: blank(v.description),
    };
  } else if (input.table === "achievements") {
    const p = achievementSchema.safeParse(input.values);
    if (!p.success) return { success: false, message: p.error.issues[0]?.message || "Check the form." };
    const v = p.data;
    id = v.id;
    row = {
      title: v.title,
      issuer: blank(v.issuer),
      achieved_date: blank(v.date),
      url: blank(v.url),
      description: blank(v.description),
    };
  } else {
    return { success: false, message: "Unknown section." };
  }

  const { error } = id
    ? await db.from(input.table).update(row).eq("id", id)
    : await db.from(input.table).insert(row);
  if (error) return { success: false, message: `Couldn't save: ${error.message}` };

  revalidateContent(input.table);
  return { success: true, message: "Saved. The resume page updates within seconds." };
}

const shieldedSave = withShield("resume_save", saveResumeBase, { limit: 30, auditLog: true });
export async function saveResumeEntry(input: SaveInput): Promise<ActionResult> {
  try {
    return await shieldedSave(input);
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Couldn't save." };
  }
}
