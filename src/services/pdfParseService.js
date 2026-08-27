import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

const PARSE_SYSTEM_PROMPT = `You are an expert at parsing and structuring resume data from raw PDF text. Your task is to extract and organize resume information into a structured JSON format.

CRITICAL GUIDELINES:
1. Extract information accurately from the provided text
2. Infer missing information only when absolutely clear from context
3. Return valid JSON only - no additional text or explanation
4. Use the exact structure provided in the schema
5. For arrays (experience, education, etc.), create array items with all available fields
6. Leave fields empty string ("") if not found in the text
7. For dates, use format "Month Year" (e.g., "January 2020")
8. Do NOT hallucinate or make up data that isn't in the resume`;

// The free tier allows only a handful of requests per minute, so a burst of
// imports (or a reload right after one) trips a 429 that clears on its own in
// well under a minute. That's a wait, not a failure — retry it rather than
// throwing the raw API error at someone who just uploaded their resume.
const MAX_RETRIES = 3;

function isRateLimit(error) {
  const m = String(error?.message || '');
  return m.includes('429') || /quota|rate.?limit/i.test(m);
}

// The API tells us exactly how long to wait, in a RetryInfo block or in prose.
// Prefer its number over a guess; fall back to a widening delay.
function retryDelayMs(error, attempt) {
  const m = String(error?.message || '');
  const seconds =
    m.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/)?.[1] ??
    m.match(/retry in (\d+(?:\.\d+)?)s/i)?.[1];
  if (seconds) return Math.ceil(Number(seconds) + 1) * 1000; // +1s of headroom
  return Math.min(60_000, 5_000 * 2 ** attempt);
}

// Turns provider errors into something a job seeker can act on. The raw message
// is a JSON blob with doc links in it — useful in a console, hostile in a dialog.
function friendlyMessage(error) {
  const m = String(error?.message || '');
  if (isRateLimit(error)) {
    return 'The AI service is busy right now (free-tier request limit). Wait about a minute and try again.';
  }
  if (/not configured/i.test(m)) {
    return 'The AI service is not set up yet — VITE_GEMINI_API_KEY is missing from your .env file.';
  }
  if (/API key not valid|API_KEY_INVALID|401|403/i.test(m)) {
    return 'The AI service rejected the API key. Check VITE_GEMINI_API_KEY in your .env file.';
  }
  if (/fetch|network|ENOTFOUND|ETIMEDOUT/i.test(m)) {
    return 'Could not reach the AI service. Check your internet connection and try again.';
  }
  if (/JSON|Unexpected token/i.test(m)) {
    return 'The AI returned a response we could not read. Try again, or build your resume from scratch.';
  }
  return 'We could not read this resume automatically. Try again, or build your resume from scratch.';
}

// onRetry({ attempt, waitMs }) lets the UI explain the pause instead of freezing.
export async function parseResumeFromPDF(extractedText, { onRetry } = {}) {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: PARSE_SYSTEM_PROMPT,
      generationConfig: {
        // gemini-2.5-flash reasons before answering by default. Measured on a
        // typical resume that cost ~2,700 thinking tokens and 17s vs 5.5s with
        // it off — for pure transcription there is nothing to reason about, so
        // the deliberation is dead latency the user watches on a spinner.
        thinkingConfig: { thinkingBudget: 0 },
        // Guarantees parseable output instead of relying on stripping ``` fences.
        responseMimeType: 'application/json',
        temperature: 0,
      },
    });

    const prompt = `Parse this resume text and extract all information into a structured JSON format.

RESUME TEXT:
${extractedText}

Return ONLY valid JSON matching this exact structure (do not include markdown, code blocks, or explanations):
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "links": [
      { "id": "link-1", "label": "LinkedIn", "url": "linkedin.com/in/janedoe" },
      { "id": "link-2", "label": "GitHub", "url": "github.com/janedoe" }
    ]
  },
  "summary": "string",
  "professionalInfo": {
    "jobTitle": "string",
    "industry": "string",
    "yearsExperience": "string",
    "seniority": "string"
  },
  "experience": [
    {
      "id": "exp-1",
      "jobTitle": "string",
      "company": "string",
      "location": "string (city/country, empty if absent)",
      "startDate": "string (Month Year)",
      "endDate": "string (Month Year)",
      "current": false,
      "description": "string",
      "bullets": [
        {
          "id": "bullet-1",
          "text": "string"
        }
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "school": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "string (the END/graduation date only, e.g. 2016 or May 2016)"
    }
  ],
  "skills": [
    {
      "id": "skill-1",
      "name": "string",
      "category": "Front-End"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "string",
      "description": "string",
      "link": "string (URL, empty if absent)",
      "technologies": "string (comma-separated, empty if absent)"
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "string",
      "issuer": "string",
      "date": "string (Month Year)"
    }
  ],
  "languages": [
    {
      "id": "lang-1",
      "name": "string",
      "proficiency": "string"
    }
  ],
  "awards": [
    {
      "id": "award-1",
      "title": "string",
      "issuer": "string",
      "date": "string (Month Year)"
    }
  ]
}

Rules:
- Extract fullName from the resume - this is critical
- address: whatever location the resume gives, even if it is not a full postal
  address. Most resumes list only a city and country ("Quezon City, Philippines")
  or just a city — capture that verbatim. Only use "" if there is no location at all.
- personalInfo.links: extract EVERY profile or portfolio URL in the resume. These
  are usually in the contact line under the name, but can also sit in their own
  "Links"/"Profiles" section or beside a project.
  - Look for: LinkedIn, GitHub, GitLab, a personal site/portfolio, Behance,
    Dribbble, Medium, Stack Overflow, X/Twitter, YouTube, Instagram, Facebook
  - label: the human name of the destination ("LinkedIn", "GitHub", "Portfolio")
  - url: exactly as written in the resume; keep it even if it has no https://
  - Recognise bare handles that clearly belong to a platform, e.g.
    "linkedin.com/in/msantos", "github.com/msantos", "msantos.dev"
  - Do NOT put the email address or phone number in links; they have their own fields
  - Do NOT invent links that are not in the text; return [] if there are genuinely none
  - Give each link a unique id ("link-1", "link-2", ...)
- skills[].category: use the resume's OWN grouping headings when it has them
  ("Languages", "Front-End", "Back-End & AI", "Databases & Tools") — these are
  free text, not a fixed list, and preserving the candidate's own grouping keeps
  their resume recognisable. If the skills are one undifferentiated list, group
  them yourself into a few meaningful buckets for their field rather than
  labelling everything "Technical". Never leave category empty.
- professionalInfo describes the role this person is positioned for, inferred from
  their most recent job title and career trajectory. These populate form controls,
  so the values must match EXACTLY:
  - jobTitle: their current/most recent title, cleaned up (e.g. "Senior Software Engineer")
  - industry: one plain word or short phrase (e.g. "Technology", "Healthcare", "Finance").
    Resumes rarely name their industry outright, so INFER it from the employers and
    the nature of the work — never leave it blank when there is any signal at all.
    A software role is "Technology"; a nurse is "Healthcare"; a bank is "Finance".
    For a student with no jobs yet, infer from their field of study.
  - yearsExperience: total career length, as EXACTLY ONE OF: "0-1" | "1-3" | "3-5" | "5-10" | "10+"
    (compute from the earliest job start date to the most recent; no other format is accepted)
  - seniority: EXACTLY ONE OF: "entry" | "mid" | "senior" | "lead" | "executive"
    (lowercase; infer from title and years - e.g. "Senior X" -> senior, "Head of X"/"VP" -> executive)
  - If the resume has no work history at all, use "" for each
- For experience and education, infer "current" as true only if explicitly stated or implied (no end date + "Present")
- Generate unique IDs for all array items (e.g., "exp-1", "exp-2", "edu-1", etc.)
- For bullets in experience, create a bullet item for each achievement/responsibility
- Return empty arrays if section not found in resume
- Return all fields - do not omit any, use empty string ("") for missing values
- Ensure valid JSON output only

Extract and structure the resume now:`;

    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text().trim();

        // responseMimeType should make fences impossible, but strip them anyway
        // rather than fail the whole import on a stray ```.
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        return normalizeResumeData(JSON.parse(jsonText));
      } catch (error) {
        lastError = error;

        // Only a rate limit is worth waiting on. A bad key or malformed output
        // will fail identically next time, so fail fast instead of stalling.
        if (!isRateLimit(error) || attempt === MAX_RETRIES) break;

        const waitMs = retryDelayMs(error, attempt);
        console.warn(`[pdf-import] rate limited, retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        onRetry?.({ attempt: attempt + 1, waitMs });
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    console.error('Error parsing resume from PDF:', lastError);
    throw new Error(friendlyMessage(lastError), { cause: lastError });
  } catch (error) {
    // Anything thrown before the retry loop (e.g. missing key) already carries a
    // usable message; don't re-wrap and lose it.
    if (error?.cause) throw error;
    console.error('Error parsing resume from PDF:', error);
    throw new Error(friendlyMessage(error), { cause: error });
  }
}

// The Job Target step renders these as <select>s, so a value outside the option
// list renders as an empty dropdown rather than an error. Clamp to the allowed
// sets and drop anything else, so a bad guess degrades to "unset", not "broken".
const YEARS_OPTIONS = ['0-1', '1-3', '3-5', '5-10', '10+'];
const SENIORITY_OPTIONS = ['entry', 'mid', 'senior', 'lead', 'executive'];

function normalizeProfessionalInfo(info = {}) {
  const years = String(info.yearsExperience || '').trim();
  const seniority = String(info.seniority || '').trim().toLowerCase();
  return {
    jobTitle: info.jobTitle || '',
    industry: info.industry || '',
    yearsExperience: YEARS_OPTIONS.includes(years) ? years : '',
    seniority: SENIORITY_OPTIONS.includes(seniority) ? seniority : '',
  };
}

// Known platforms, matched against the URL. Used to fill in a missing label —
// the two-column template renders "{label}: {url}", so an empty label shows up
// as a bare leading colon.
const LINK_LABELS = [
  ['linkedin.', 'LinkedIn'],
  ['github.', 'GitHub'],
  ['gitlab.', 'GitLab'],
  ['behance.', 'Behance'],
  ['dribbble.', 'Dribbble'],
  ['medium.', 'Medium'],
  ['stackoverflow.', 'Stack Overflow'],
  ['youtube.', 'YouTube'],
  ['instagram.', 'Instagram'],
  ['facebook.', 'Facebook'],
  ['twitter.', 'Twitter'],
  ['x.com', 'X'],
];

function labelForUrl(url) {
  const u = String(url).toLowerCase();
  const hit = LINK_LABELS.find(([domain]) => u.includes(domain));
  return hit ? hit[1] : 'Portfolio';
}

function normalizeLinks(raw) {
  if (!Array.isArray(raw)) return [];

  const seen = new Set();
  return raw
    .map((link) => {
      // Accept a bare string too — models sometimes return ["github.com/x"]
      // instead of objects, and dropping those would lose real links.
      const obj = typeof link === 'string' ? { url: link } : (link || {});
      const url = String(obj.url || '').trim().replace(/^(mailto:|tel:)/i, '');
      const label = String(obj.label || '').trim();
      return { url, label };
    })
    // Email/phone have dedicated fields; a stray one here would render twice.
    .filter(({ url, label }) => (url || label) && !url.includes('@'))
    .filter(({ url }) => {
      // Same profile listed twice (e.g. header and a Links section) renders as a
      // duplicate contact line, so keep the first occurrence only.
      const key = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ url, label }, i) => ({
      id: `link-${i + 1}`,
      label: label || labelForUrl(url),
      url,
    }));
}

function normalizeResumeData(data) {
  return {
    professionalInfo: normalizeProfessionalInfo(data.professionalInfo),
    personalInfo: {
      fullName: data.personalInfo?.fullName || '',
      email: data.personalInfo?.email || '',
      phone: data.personalInfo?.phone || '',
      address: data.personalInfo?.address || '',
      links: normalizeLinks(data.personalInfo?.links),
      photo: '',
    },
    summary: data.summary || '',
    experience: Array.isArray(data.experience)
      ? data.experience.map((exp, i) => ({
          id: exp.id || `exp-${i + 1}`,
          jobTitle: exp.jobTitle || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: exp.current || false,
          description: exp.description || '',
          bullets: Array.isArray(exp.bullets)
            ? exp.bullets.map((b, j) => ({
                id: b.id || `bullet-${j + 1}`,
                text: b.text || '',
              }))
            : [],
        }))
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((edu, i) => ({
          id: edu.id || `edu-${i + 1}`,
          school: edu.school || '',
          degree: edu.degree || '',
          field: edu.field || '',
          // The app models education with a single graduation date, not a range.
          graduationDate: edu.graduationDate || edu.endDate || '',
        }))
      : [],
    skills: Array.isArray(data.skills)
      ? data.skills.map((skill, i) => ({
          id: skill.id || `skill-${i + 1}`,
          name: skill.name || '',
          category: skill.category || 'Other',
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.map((proj, i) => ({
          id: proj.id || `proj-${i + 1}`,
          name: proj.name || '',
          description: proj.description || '',
          link: proj.link || proj.url || '',
          technologies: proj.technologies || '',
        }))
      : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications.map((cert, i) => ({
          id: cert.id || `cert-${i + 1}`,
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
        }))
      : [],
    languages: Array.isArray(data.languages)
      ? data.languages.map((lang, i) => ({
          id: lang.id || `lang-${i + 1}`,
          name: lang.name || '',
          proficiency: lang.proficiency || '',
        }))
      : [],
    awards: Array.isArray(data.awards)
      ? data.awards.map((award, i) => ({
          id: award.id || `award-${i + 1}`,
          title: award.title || '',
          issuer: award.issuer || '',
          date: award.date || '',
        }))
      : [],
  };
}
