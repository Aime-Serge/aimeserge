import type { Achievement, Certificate, Education, Experience, Organization } from "@/core/domain/portfolio/types";
import type { CvData } from "@/core/domain/admin/cv-schema";
import generatedJson from "./resume.generated.json";

/**
 * YOUR RESUME, IN ONE PLACE.
 *
 * The Resume page shows this whenever the database has no entries for a
 * section (or can't be reached), so the page is never empty.
 * As soon as a section has entries in the database (edited in /admin), the
 * database wins for that section.
 *
 * AUTOMATIC UPDATES: put a new CV PDF in the cv/ folder and push to main.
 * A GitHub Action (.github/workflows/cv-sync.yml) reads it and writes
 * resume.generated.json, which replaces the hand-written lists below.
 * To edit by hand instead: change the lists below (newest first), commit, push.
 * Keep it plain language, and don't add numbers you can't show a source for.
 * Mirrors supabase/migrations up to 20261110190000.
 */

/**
 * Never shown on the site, even if a CV lists them (checked by name, case-insensitive).
 * Used by the "Update from CV" import in /admin.
 */
export const RESUME_EXCLUDE = ["University of Rwanda"];

const org = (id: string, name: string): Organization => ({ id, name });
const INEZA = org("ineza-ai", "INEZA AI");
const DUKA = org("dukaai", "DukaAI");
const ZGATE = org("z-gate", "Z-Gate LTD");
const IHACKS = org("innovation-hacks", "Innovation Hacks");
const ALX = org("alx-africa", "ALX Africa");
const EFN = org("ef-nexus", "EF NEXUS");
const BITT = org("bittwork", "Bittwork Technology");
const RCR = org("rwanda-cancer-relief", "Rwanda Cancer Relief");
const IEE = org("iee-rwanda", "IEE Rwanda");
const BUMBOGO = org("es-bumbogo", "Ecole Secondaire Bumbogo");
const AWS = org("aws", "AWS");
const GOOGLE = org("google", "Google");

type Role = Omit<Experience, "id" | "companyId" | "company" | "skillsUsed" | "locationType" | "employmentType"> &
  Partial<Pick<Experience, "employmentType" | "locationType" | "skillsUsed">> & { company: Organization };

const roles: Role[] = [
  {
    company: INEZA, title: "Founder & Product Manager", location: "Kigali, Rwanda",
    startDate: "2026-03-01",
    description: "Founded INEZA AI, a health venture building an AI-assisted health management system for Rwanda's clinics, with my partner Bahati Pierre, under ALU's Center for Health Innovation and Impact (CHII) and the Africa Health Collaborative. I lead product: roadmap, user research with health workers, and the prototype.",
  },
  {
    company: DUKA, title: "Co-Founder & UX Analyst", location: "Kigali, Rwanda",
    startDate: "2026-10-01",
    description: "Co-founded DukaAI, which turns photos of handwritten sales notebooks (Kinyarwanda, French or English) into digital records, debt tracking and business insights for small shops and micro-finance lenders. I lead UX: researching how shop owners keep records today and designing a flow that fits how they already work. Our team placed 2nd at Hacktoberfest Hack Day Kigali 2026.",
  },
  {
    company: ZGATE, title: "Assistant Product Manager", location: "Kigali, Rwanda",
    startDate: "2026-08-01",
    description: "Help own the product roadmap and keep it aligned with business goals. Research customer needs and market trends, work with engineering to improve features based on user feedback, and use sales data to guide what we build next.",
  },
  {
    company: IHACKS, title: "Full-stack Developer Intern", employmentType: "INTERNSHIP",
    startDate: "2026-08-22", endDate: "2026-09-22",
    description: "Built front-end and back-end features as a full-stack developer intern at Innovation Hacks.",
  },
  {
    company: ALX, title: "ALX Ventures Rwanda Ambassador", employmentType: "PART_TIME", location: "Kigali, Rwanda",
    startDate: "2026-04-01",
    description: "I represent ALX Ventures, ALX's programme for entrepreneurs and startups, in Rwanda. I build partnerships and run community outreach that bring more young innovators and founders into the ecosystem.",
  },
  {
    company: ALX, title: "Software Engineer", location: "Kigali, Rwanda",
    startDate: "2025-01-01", endDate: "2026-02-28",
    description: "Worked with cross-functional teams in ALX's tech community and delivered 15+ projects on deadline. Built and maintained responsive web applications, made back-end APIs faster, and ran security audits to find and fix weaknesses.",
  },
  {
    company: BITT, title: "Software Engineering Intern", employmentType: "INTERNSHIP",
    startDate: "2025-10-01", endDate: "2025-12-31",
    description: "Built software that helped the team work more efficiently, shipped features with cross-functional teams, and designed user-friendly interfaces.",
  },
  {
    company: EFN, title: "Software Developer", location: "Norrsken, Kigali",
    startDate: "2025-07-01", endDate: "2025-12-31",
    description: "EF NEXUS builds AI-driven education for young people. I built responsive interface components, worked with UX designers on features that keep learners coming back, and introduced a design framework that made development faster.",
  },
  {
    company: RCR, title: "Technical Lead Volunteer", employmentType: "VOLUNTEER",
    startDate: "2025-07-01",
    description: "I lead technology work as a volunteer with Rwanda Cancer Relief, using digital tools to improve cancer education, care and access to services.",
  },
  {
    company: IEE, title: "Teaching Assistant", employmentType: "VOLUNTEER", location: "Kigali, Rwanda",
    startDate: "2024-12-01", endDate: "2025-06-30",
    description: "Led training sessions for teachers with IEE Rwanda on using digital tools in class and on competency-based teaching.",
  },
];

export const resumeExperiences: Experience[] = roles.map((r, i) => ({
  employmentType: "FULL_TIME",
  locationType: "ON_SITE",
  skillsUsed: [],
  ...r,
  id: `resume-exp-${i}`,
  companyId: r.company.id,
}));

export const resumeEducations: Education[] = [
  {
    id: "resume-edu-0", institutionId: BUMBOGO.id, institution: BUMBOGO,
    degree: "High School Diploma", fieldOfStudy: "Mathematics, Physics and Computer Science",
    startDate: "2021-09-01", endDate: "2024-06-30", grade: "3.67/4.0",
    description: "Graduated with honours. Completed an Embedded Systems and Robotics bootcamp.",
  },
];

const cert = (i: number, c: Omit<Certificate, "id">): Certificate => ({ id: `resume-cert-${i}`, ...c });

export const resumeCertificates: Certificate[] = [
  cert(0, { name: "Non-degree in Agentic Engineering", provider: "AWS", issuer: AWS, issueDate: "2026-04",
    description: "AWS AI/ML Scholars programme (USA). Completed advanced projects in autonomous systems design and worked on real-world engineering challenges with industry professionals." }),
  cert(1, { name: "AWS AI/ML Practical Challenge", provider: "AWS", issuer: AWS, issueDate: "2026",
    description: "Hands-on AI/ML challenge completed as part of the AWS AI/ML Scholars programme." }),
  cert(2, { name: "Non-degree Certificate in Cybersecurity", provider: "ALX Africa", issuer: ALX, issueDate: "2026-01", expiryDate: "2026-05-31",
    description: "Kigali, Rwanda. Hands-on projects simulating real-world cyber threats; certification in ethical hacking and network security. Top 10% in cybersecurity coursework." }),
  cert(3, { name: "Certifications and Skill Badges in Cloud Computing", provider: "Google", issuer: GOOGLE, issueDate: "2025-10", expiryDate: "2026-02-28",
    description: "24+ Google Cloud skill badges covering cloud architecture, cloud security and management, earned through hands-on projects." }),
  cert(4, { name: "Non-degree Certification in Software Engineering", provider: "ALX Africa", issuer: ALX, issueDate: "2025-01", expiryDate: "2026-02-28",
    description: "Built 12 full-stack applications as capstone projects, using several programming languages and agile team practices. Top 1% in final assessments among East African participants." }),
  cert(5, { name: "Certification in Professional Foundations", provider: "ALX Africa", issuer: ALX, issueDate: "2025-01", expiryDate: "2025-04-30",
    description: "Kigali, Rwanda. Workplace and digital-age professional skills: project and product management and leadership. Top 5% of the cohort." }),
  cert(6, { name: "ALX Freelancer Academy", provider: "ALX Africa", issuer: ALX, issueDate: "2025",
    description: "Freelancing skills: finding clients, scoping and pricing work, and delivering projects professionally." }),
];

export const resumeAchievements: Achievement[] = [
  { id: "resume-ach-0", title: "2nd Place, Hacktoberfest Hack Day Kigali 2026 (DukaAI)", issuer: "Hacktoberfest · Major League Hacking", achievedDate: "2026" },
  { id: "resume-ach-1", title: "4th Place, Innovate With Google Cloud Hackathon", issuer: "Google Cloud" },
];

// ─── Automatic CV sync ─────────────────────────────────────────────────────
// When scripts/cv-sync.ts has written resume.generated.json, it wins over the
// hand-written lists above.

type Generated = { generatedAt: string; source: string; cvUrl: string; data: CvData } | null;
const generated = generatedJson as unknown as Generated;

const DEFAULT_CV_URL = "/uploads/Aime_Serge_Ukobizaba_CV_01-3.pdf";
/** The CV the "Download CV" button serves when no CV link is saved in /admin. */
export const RESUME_CV_URL = generated?.cvUrl || DEFAULT_CV_URL;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const day = (d?: string | null) => (d ? (d.length === 4 ? `${d}-01-01` : `${d}-01`) : undefined);

function fromGenerated(d: CvData) {
  const o = (name: string) => org(slug(name), name);
  return {
    experiences: d.experiences.map((e, i): Experience => ({
      id: `cv-exp-${i}`, title: e.title, employmentType: e.employmentType, location: e.location,
      locationType: "ON_SITE", startDate: day(e.startDate)!, endDate: day(e.endDate),
      description: e.description, skillsUsed: [], companyId: slug(e.organization), company: o(e.organization),
    })),
    educations: d.educations.map((e, i): Education => ({
      id: `cv-edu-${i}`, institutionId: slug(e.institution), institution: o(e.institution), degree: e.degree,
      fieldOfStudy: e.fieldOfStudy, startDate: day(e.startDate), endDate: day(e.endDate), grade: e.grade, description: e.description,
    })),
    certificates: d.certificates.map((c, i): Certificate => ({
      id: `cv-cert-${i}`, name: c.name, provider: c.provider, issuer: o(c.provider), issueDate: c.issueDate,
      expiryDate: day(c.expiryDate), description: c.description,
    })),
    achievements: d.achievements.map((a, i): Achievement => ({
      id: `cv-ach-${i}`, title: a.title, issuer: a.issuer, achievedDate: a.date,
    })),
  };
}

const fromCv = generated?.data ? fromGenerated(generated.data) : null;
export const RESUME = {
  experiences: fromCv?.experiences ?? resumeExperiences,
  educations: fromCv?.educations ?? resumeEducations,
  certificates: fromCv?.certificates ?? resumeCertificates,
  achievements: fromCv?.achievements ?? resumeAchievements,
};
