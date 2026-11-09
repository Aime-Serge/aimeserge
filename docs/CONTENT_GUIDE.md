# Content Guide

How we write for this site. Use it for every page, project case study, blog post, toast and error message.

## Who reads this site

| Reader | What they want in 30 seconds | What wins them |
|---|---|---|
| **Recruiter / HR** (often non-technical) | Job title, where he worked, the CV | A plain headline, a list of employers, a "Download CV" button |
| **Hiring manager / engineer** | Can he really do it? | Project case studies with code links and honest results |
| **Client / founder** | Can he solve my problem, and how do I start? | Outcomes ("your users find answers faster"), a short contact form |
| **Partner / academic** | Research quality | A plain summary at the top of each paper, method, data source |

Write for the **recruiter first**. If they understand it, everyone does.

## The five rules

1. **Say it plainly.** Short words, short sentences (aim for under 20 words). One idea per sentence.
2. **Outcome first, technology second.** "Your app stays fast on slow phones (built with Next.js)", not "Next.js 15 SSR edge architecture".
3. **Only claim what we can prove.** Every number, title and testimonial must be checkable on the CV, a certificate link, GitHub, or a named source. If it can't be proved, cut it.
4. **Be consistent.** Name, title, email, links and domain come from `src/config/site.ts`. Never hard-code them.
5. **Sound like a person.** First person ("I build…") on pages; third person ("Aime built…") in the AI assistant's answers.

## Banned words and their replacements

| Don't write | Write instead |
|---|---|
| Node, Digital node, Node_01 | (drop it) / "me", "the site" |
| Handshake, Sync, Synchronized | "sent", "subscribed", "saved" |
| Payload, Transmission, Transmit | "message", "send" |
| Protocol node / Contact_Node | "Email" |
| Response latency: T-minus 24–48 h | "I reply within 1–2 working days." |
| Mission Analysis / Mission requirements | "The story" / "About your project" |
| Professional Blueprint | "Resume" |
| Engineered Solutions / Deployment_Logs | "Projects" |
| Neural_Skills_Matrix, 95 % Backend | "Skills & tools" + a plain tool list (no self-rated %) |
| Zero-Trust, Security-hardened, A+ audit | "Security built in: safe logins, protected data, input checks" |
| Senior Software Engineer | "Software Engineer" (matches the CV) |
| Snake_Case_Labels, ALL_CAPS_MONO | Normal sentence-case headings |
| Error: Quantum decoherence… | "Something went wrong. Please try again." + a way out (email) |

Technical terms are fine **inside case studies** for engineers, but explain each one the first time in a few words, e.g. "RAG (the AI looks up answers in my own documents before replying)".

## Numbers and proof

- A metric needs: the number, what it measures, the baseline, and the source. Example: "Cut page load from 4.1 s to 1.8 s (Lighthouse, mobile, March 2026)."
- No visitor counts, "verified" badges, or audit grades unless they are generated live or link to the report.
- Testimonials: real name, real role, written permission, ideally a LinkedIn recommendation link. Otherwise leave the section empty; it hides itself automatically.

## Project case study template

```
Title:    What it is, in under 8 words
One-line: Who it helps and how
Problem:  2–3 sentences anyone can understand
What I did: 3–5 bullets, verbs first ("Built…", "Designed…")
Result:   Honest outcome, with numbers only if measured
Tools:    Short list
Links:    Live demo · Code · PDF
```

## Microcopy patterns

- **Buttons** say what happens: "Send message", "Download CV", "See my projects".
- **Success**: confirm and set expectations: "Thanks! Your message has been sent. I'll reply within 1–2 working days."
- **Errors**: say what happened, and give a way forward: "Your message couldn't be sent. Please email me at …"
- **Form labels** are visible, sentence-case, and linked to the input (`htmlFor`).
