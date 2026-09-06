# VeraShield — Product Vision

> Free, bilingual deepfake detection and crisis response for teen victims — not enterprises.

---

## 1. Vision & Mission

**Vision statement**
A world where any teen, in any language, can instantly know if they've been deepfaked — and know exactly what to do next.

**Mission statement**
VeraShield gives minors under 18 in Mexico and India a free, bilingual tool to detect deepfake media and access age-appropriate legal crisis guidance — in Spanish, Hindi, and English.

**Founder's why**
Cas is a Mexican teen who is the target user. Her teammate is an Indian teen who is the target user in India. Every enterprise deepfake tool was built for corporations. We built VeraShield because nobody built it for us.

**Core values**
- **Privacy by design** — We log zero personal data. A scared teen should never fear that using this tool exposes them further.
- **Language justice** — If your crisis tool is English-only, it does not serve 90% of the world's teenagers. Spanish and Hindi are not secondary languages.
- **Calm authority** — We speak like a knowledgeable older sibling, not a legal disclaimer. Clear, direct, never condescending.
- **Radical accessibility** — No account. No payment. No app install. Any phone, any browser, any teen.

---

## 2. User Research

### Primary persona — "Sofía / Priya"

| Field | Detail |
|---|---|
| Age | 14–17 |
| Location | Mexico City / Delhi |
| Language | Spanish (MX) / Hindi (IN) |
| Device | Smartphone, mobile browser |
| Discovery | A classmate shares a link. She opens it and sees herself in a fake video. |
| Immediate feeling | Panic, shame, freezing. She doesn't know if it's real. She doesn't know who to tell. |
| First action | Searches on her phone in Spanish or Hindi. Finds nothing helpful. |
| Barrier to help | Every tool requires English, an adult account, or money. Legal guidance is buried in government PDFs she can't understand. |

**Jobs to be done**
- Confirm quickly whether the media is actually AI-generated
- Understand what legal options exist in her country without reading dense legalese
- Find a trustworthy adult or organization to contact
- Do all of this without creating an account or sharing personal information

**Pain points**
- No free detection tool exists with a real UI in Spanish or Hindi
- Crisis resources are fragmented — no single page combines detection + legal steps + NGO contacts
- Teen victims often wait days before acting because they don't know what to do
- Fear of reporting making the situation worse is a documented barrier (Deeptrace 2023)

### Secondary persona — School counselor / NGO staff

| Field | Detail |
|---|---|
| Role | School counselor, NGO caseworker, or parent |
| Need | A credible free tool to recommend to a student victim |
| Barrier | Can't recommend paid enterprise tools; needs something safe and appropriate for minors |

### Current alternatives (and why they fail)

| Tool | Price | Language | Victim pathway | Why it fails teens |
|---|---|---|---|---|
| Hive Moderation | Enterprise | EN only | None | Requires developer API access |
| Sensity AI | $299/mo | EN only | None | Paid, enterprise-only |
| Azure Content Safety | API only | EN primary | None | No UI, no victim support |
| FotoForensics | Free | EN only | None | Not deepfake-specific |
| Google Search | Free | Any | None | No curated crisis guidance |

**Key gap:** Zero existing tools are (a) free, (b) bilingual ES/HI, and (c) paired with a crisis pathway for minors.

### Key assumptions to validate
- [ ] Teen victims will use a web tool on mobile without creating an account
- [ ] NGOs will recommend or partner with a student-built tool if it is credible
- [ ] Spanish-language legal guidance reduces time-to-action for MX victims
- [ ] Hindi-language interface is materially more usable than English for the India segment
- [ ] Detection confidence score (0–100%) is meaningful and actionable for a non-technical teen

### User journey map

```
Discovery → Panic search (mobile, Spanish/Hindi) → Finds VeraShield
→ Uploads media → Sees score in 3 seconds → Reads result in her language
→ Opens crisis pathway → Selects her country → Reads 3 legal steps
→ Sees NGO phone number → Calls or shares with a trusted adult
→ Knows what to do next
```

---

## 3. Product Strategy

### Product principles
1. **Speed first** — Detection result in under 5 seconds. Every extra second is a second of panic.
2. **Language = respect** — UI defaults to the user's detected browser language. No extra step to get Spanish or Hindi.
3. **No friction = no barriers** — No account, no email, no upload size warning on first screen.
4. **Show, don't lecture** — Crisis pathway is a short numbered list, not a wall of text.
5. **Privacy is the product** — Zero PII. Anonymous logging only. This must be true and legible.

### Market differentiation
VeraShield is not a deepfake detection API. It is a crisis response tool that happens to use deepfake detection. The detection score is the entry point; the crisis pathway is the value. No competitor has built this for minors, in Spanish, in Hindi, for free.

### Magic moment
> User uploads a photo. 3 seconds later: **"87% likely AI-generated — here's what to do."**
> Below the score: 3 numbered legal steps in Spanish. A red button: "Call Red Infancia MX now."

This must be achievable in the MVP.

### MVP definition (Phase 1 — Sept 6–8)

**In scope:**
- Single-page web app (index.html)
- Language toggle: ES / EN (HI added in Phase 2)
- File upload → Vercel serverless function → Hive API call → score display
- Static crisis pathway cards: MX card (Spanish), India card (English placeholder), General card
- Anonymous Google Sheets logging: timestamp, country guess, score bucket, result label
- Mobile-first responsive layout
- Vercel deploy from GitHub main branch

**Explicitly out of scope for MVP:**
- User accounts or any login
- Hindi translations (Phase 2 — teammate's deliverable)
- Country selector (Phase 2)
- NGO directory with clickable cards (Phase 2)
- Video deepfake detection (post-MVP)
- Payment or monetization UI
- Admin dashboard

### Feature priority (MoSCoW)

| Priority | Feature |
|---|---|
| **Must** | File upload + Hive API detection |
| **Must** | Score display with plain-language interpretation |
| **Must** | Crisis pathway cards (static, MX + placeholder India) |
| **Must** | Language toggle ES/EN |
| **Must** | Anonymous Google Sheets logging |
| **Must** | Mobile-responsive layout |
| **Should** | Hindi translation (Phase 2) |
| **Should** | Country selector → localized content |
| **Should** | NGO directory with phone + website |
| **Could** | Azure fallback if Hive quota exceeded |
| **Won't (MVP)** | Video detection, user accounts, payments |

### Success metrics (by Oct 29, 2026)
- 50+ detections run (logged in Google Sheets)
- 20+ student survey responses
- 1+ confirmed NGO partner (Red Infancia MX or Cyber Peace Foundation India)
- App loads on mobile in < 3 seconds (measured via Vercel Analytics)
- Zero PII in Google Sheets log (verified manually)

### Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hive free tier (100 calls/day) exhausted | Medium | Azure fallback; log quota warnings |
| Teammate can't contribute Hindi content on schedule | Medium | MVP works in ES/EN only; Hindi is Phase 2 |
| Conrad judges want app in English | Low | English is already one of the three language options |
| Google Sheets service account key expires or breaks | Low | Log failures silently — logging is not core to user value |

---

## 4. Brand Strategy

### Positioning statement
For teen girls in Mexico and India who discover they may appear in a deepfake, VeraShield is the only free, bilingual (Spanish/Hindi) tool that combines instant AI detection with a step-by-step crisis pathway — unlike enterprise tools that were never built for them.

### Brand personality
- **Trustworthy** — Uses real AI. Cites sources. Doesn't exaggerate confidence scores.
- **Clear** — Short sentences. No jargon. Results in plain language.
- **Empowering** — "Here's what you can do" not "Here's what happened to you."
- **Calm under pressure** — Design and copy stay steady even when showing a high-risk score.
- **Youth-forward** — Built by teens, for teens. The team story is part of the brand.

### Voice & tone guide

**DO:**
- "This image is likely AI-generated. Here's what that means and what you can do."
- "You don't need to create an account. Upload and get your result in seconds."
- "Step 1: Screenshot and save the evidence before reporting."

**DON'T:**
- "WARNING: DEEPFAKE DETECTED" (alarm language increases panic)
- "Our proprietary neural network has determined with 87.3% confidence..." (jargon)
- "Please read our terms before proceeding." (friction before value)
- "Your data is safe with us." (implies we store data — we don't)

### Elevator pitches

**5 seconds:** "Free deepfake detection for teens, in Spanish and Hindi, with legal guidance built in."

**30 seconds:** "VeraShield is a bilingual web app for teen victims of deepfake abuse. You upload a photo, our AI tells you if it's fake, and you immediately see your legal options and which NGO to call — all in Spanish or Hindi, free, no account required."

**2 minutes:** "Every year, thousands of teens worldwide discover they've been deepfaked. The tools that can detect it are expensive, English-only, and built for companies. A panicked 15-year-old in Mexico City or Delhi can't use them. VeraShield is the first free, bilingual deepfake detection tool built specifically for minors under 18. It pairs instant AI detection with a crisis pathway — legal steps, NGO contacts, and reporting guides tailored to Mexico and India. We log zero personal data. We require no account. We speak Spanish and Hindi because that's what our users speak. VeraShield was built by two teens, one from Mexico and one from India, who understood that the best way to close this gap was to close it ourselves."

### Brand anti-patterns
- Do NOT feel like a surveillance or government monitoring tool
- Do NOT use red/alarm as primary UI color — only for critical score results
- Do NOT use corporate stock photography
- Do NOT add cookie banners or data consent popups (we collect no data that requires them)
- Do NOT make the upload the first thing the user sees — lead with trust, then action

---

## 5. Design Direction

### Design philosophy
Calm authority. Dark background creates focus and reduces panic association with bright medical/warning UIs. Teal accent signals safety and technology. Every screen has one primary action. No visual clutter.

### Color palette

```css
:root {
  --color-bg:        #0B1929;  /* Deep navy — primary background */
  --color-surface:   #132238;  /* Slightly lighter surface for cards */
  --color-accent:    #00C9B1;  /* Teal — primary CTA, progress, success */
  --color-amber:     #F5A623;  /* Amber — warning, medium-risk scores */
  --color-red:       #E84855;  /* Red — high-risk scores only */
  --color-text:      #E2E8F0;  /* Body text — off-white */
  --color-muted:     #94A3B8;  /* Secondary text, labels */
  --color-white:     #FFFFFF;  /* Headings, buttons */
  --color-border:    #1E3352;  /* Subtle borders */
}
```

**Score color mapping:**
- 0–30% (likely real): `--color-accent` (teal)
- 31–69% (uncertain): `--color-amber`
- 70–100% (likely fake): `--color-red`

### Typography

```css
/* Google Fonts — load all three */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --font-display: 'Syne', sans-serif;    /* Headlines, hero text */
  --font-body:    'Inter', sans-serif;   /* All body copy, UI labels */
  --font-mono:    'JetBrains Mono', monospace; /* Score display, code */
}
```

### Spacing & layout system

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --max-width: 640px; /* Mobile-first, content centered on desktop */
}
```

### Component philosophy
- Cards use `--color-surface` bg with `--radius-md` and subtle `--color-border` border
- Primary button: `--color-accent` bg, `--color-bg` text, `--radius-sm`, full width on mobile
- Score display: large `--font-mono`, color changes based on score bucket
- Crisis pathway: numbered list, each item max 2 lines, icon + text

### Accessibility commitments
- Minimum 4.5:1 contrast ratio for all body text (WCAG AA)
- All interactive elements have `:focus-visible` outlines
- Upload area supports keyboard navigation and screen reader labels
- Score result announced to screen readers via `aria-live="polite"`
- Language toggle is the first keyboard-accessible element on the page
