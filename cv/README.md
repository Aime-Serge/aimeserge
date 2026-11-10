# Your CV goes here

Put your latest CV here as a PDF and push to `main`. That's all.

Within a few minutes the website updates by itself:

- the Resume page (experience, education, certificates, achievements)
- the "Download CV" button, which serves this PDF

If the CV can't be read cleanly, nothing on the site changes and the GitHub
Actions run is marked as failed (you get an email from GitHub).

The newest PDF in this folder is used. Old versions can stay here as a history.
Things listed in `RESUME_EXCLUDE` in `src/config/resume.ts` (for example the
University of Rwanda) are never shown.
