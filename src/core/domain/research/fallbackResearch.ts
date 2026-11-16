import type { ResearchPaper } from "./types";

/*
 * Research shown until papers are managed in Admin → Research (and the
 * fallback if the database can't be reached). Plain-language summaries;
 * every number comes from the manuscript and the sources it cites.
 */

export const fallbackResearch: ResearchPaper[] = [
  {
    id: "referral-loop-rwanda",
    slug: "referral-loop-rwanda",
    title: "Closing the Referral Loop: Community-to-Facility Referral and Counter-Referral Continuity in Rwanda's Primary Health Care System, 2015–2025",
    abstract:
      "When a community health worker in Rwanda sends a patient to a health centre or hospital, does anyone tell them what happened next? This scoping review of 45 sources from 2015–2025 follows a referral through six handoffs. Sending patients to care is well documented and largely digital. The return journey, where the facility reports back and the community health worker follows up, is almost unmeasured: in the only multi-facility audit, 3.9% of counter-referral fields were filled in, and no study followed a community referral from start to finish.",
    pdfUrl: "",
    tags: ["health", "referral", "community health workers", "digital health", "Rwanda", "scoping review"],
    views: 0,
    downloads: 0,
    createdAt: "2026-11-16",
    authors: [{ name: "Aime Serge Ukobizaba", affiliation: "Z-Gate LTD" }],
    publicationDate: "2026-11-16",
    category: "Health · Scoping review",
    language: "en",
    citations: 0,
    status: "in_progress",
    assets: [],
    content: [
      {
        id: "why",
        order: 1,
        title: "Why it matters",
        content:
          "Rwanda's health care starts in the village. Between 58,000 and 60,000 community health workers (CHWs) spot danger signs and send patients to a health post, health centre or hospital.\n\nRwanda's own referral guidelines (2020) say a referral is only complete when the facility sends the result and a care plan back to whoever made the referral. This return message is called a counter-referral. Without it, the CHW can't follow the patient up at home.\n\nWhen referrals break down, people die. In a national audit of 987 maternal deaths (2009–2013), failures in services were the main factor in 61% of cases. Yet no one had brought together what is known about whether Rwanda's referral loops actually close.",
      },
      {
        id: "how",
        order: 2,
        title: "What the review did",
        content:
          "A rapid scoping review (Arksey and O'Malley method, reported with PRISMA-ScR) of studies, government documents and reports from 2015 to 2025.\n\nIt splits a referral into six handoffs:\n1. Forward: the CHW decides to refer (H1), the referral is sent (H2), the patient arrives (H3).\n2. Return: the facility records the outcome (H4), sends it back (H5), and the CHW follows up (H6).\n\nThe loop counts as closed only when the last step is recorded. Each finding was given a confidence rating (high, moderate or low) based on how strong the study design was.\n\n45 sources were included, 23 of them Rwandan studies.",
      },
      {
        id: "forward",
        order: 3,
        title: "Finding 1: sending patients is well covered",
        content:
          "The forward journey is the best-documented and most improved part.\n\n• A digital screening tool built into the CHWs' electronic record (d-IDS) helped CHWs treat more people at home: 55.1% of 3,060 people screened were managed in the community, and referrals fell by 24.2%.\n• SMS reporting (RapidSMS) only increased service use where it came with training, supervision and equipment.\n• Distance, cost, time and insurance delayed care at every level. For example, a trip of more than 90 minutes from health centre to hospital was linked to worse newborn outcomes.",
      },
      {
        id: "return",
        order: 4,
        title: "Finding 2: the return journey is almost unmeasured",
        content:
          "This is where the evidence, and the system, are weakest.\n\n• In 2,304 referral letters from 11 Kigali facilities (2019–2021), the referring section of the standard form was 83.3% complete, but the counter-referral section only 3.9%.\n• Only 4 of 13 facilities fed findings from maternal and newborn death reviews back to communities, and none tracked whether their recommendations were carried out.\n• No study measured whether a CHW received and acted on a care plan after a patient's facility visit.\n\nWhy: each level has its own record system (community, health centre and hospital), and they don't yet pass referral results between each other. CHWs are volunteers with heavy workloads, and incentives reward the number of referrals, not closing the loop.",
      },
      {
        id: "change",
        order: 5,
        title: "What should change",
        content:
          "1. Measure it. Define a standard \"referral-loop closure rate\": the share of referrals where the facility outcome and the counter-referral reach the referring level within a set time, such as 7 days for urgent cases and 30 for chronic ones.\n2. Connect the records. Give each referral one ID shared by the community, health-centre and hospital systems, using the national FHIR standard, so closure can be counted automatically.\n3. Reward closure, not just volume, in performance incentives.\n4. Extend the feedback used in death reviews to everyday referrals.\n\nThe review also proposes a three-phase study: a baseline audit linking records across levels, interviews and time–motion observation to find root causes, and a trial of a loop-closure strategy.",
      },
      {
        id: "limits",
        order: 6,
        title: "Limits and status",
        content:
          "This is a draft manuscript, not yet peer reviewed.\n\nIt was a rapid review: one reviewer, searches through a general web search tool rather than each database directly, and no protocol registered in advance. Some findings rest on abstracts, Kinyarwanda and French grey literature wasn't searched, and several key studies come from Kigali or a few districts.\n\nAbsence of evidence is not evidence of absence: counter-referral data may exist in unpublished reports. The review declares a potential conflict of interest, because it was conceived alongside work on a referral-continuity initiative.\n\nNext: re-run the search in the main databases, add a second reviewer and register a protocol before submitting to a journal.",
      },
    ],
  },
];
