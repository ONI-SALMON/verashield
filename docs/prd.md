# VeraShield — Product Requirements Document

**Version:** MVP 1.0  
**Target deploy:** Sept 8, 2026  
**Platform:** Web (mobile-first)

---

## 1. Overview

| Field | Value |
|---|---|
| Product name | VeraShield |
| One-liner | Free bilingual deepfake detection + crisis response for teen victims |
| Objective | Let any teen upload suspected media, get a deepfake probability score in under 5 seconds, and immediately see what to do legally in Mexico or India |
| Differentiation | Only free, bilingual (ES/HI/EN), under-18-focused tool that pairs detection with a crisis pathway |
| Magic moment | Upload image → 3 seconds → "87% likely AI-generated" → crisis steps in their language + NGO phone number |
| Success criteria | 50+ detections logged, < 5s response time, zero PII in logs, works on any mobile browser |

---

## 2. Technical Architecture

### Architecture overview

```
User (mobile browser)
       │
       ▼
  index.html (Vercel static)
       │  POST /api/detect (FormData)
       ▼
  api/detect.js (Vercel serverless, Node.js)
       │  POST to Hive API (server-side, key never exposed)
       ▼
  Hive AI deepfake detection
       │  Returns { score, status }
       ▼
  api/detect.js
       │  POST to Google Sheets (service account, async — does not block response)
       ▼
  Google Sheets (anonymous log)
       │
  Returns { score, label, steps } to frontend
       │
  index.html renders result + crisis pathway
```

### Stack table

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Vanilla HTML + CSS + JS | Zero build step, works everywhere, no framework dependency |
| Backend | Vercel serverless (Node.js) | Free tier, auto-deploy, hides API key from client |
| Detection API | Hive AI (primary) | Free 100 calls/day, best deepfake-specific accuracy |
| Detection fallback | Azure AI Content Safety | 5,000 free/month |
| Logging | Google Sheets API v4 | Free, no database setup, visual for team review |
| Hosting | Vercel free tier | Auto-deploy on push to `main` |
| Fonts | Google Fonts (Syne, Inter, JetBrains Mono) | Free CDN |

### Repo structure

```
verashield/
├── index.html          # Single page — entire frontend
├── styles.css          # All CSS — imported in index.html
├── app.js              # All frontend JS — handles upload, fetch, UI updates
├── api/
│   └── detect.js       # Vercel serverless function — Hive API call + Sheets logging
├── data/
│   ├── ngos_mexico.json     # MX NGO directory (Cas fills)
│   ├── ngos_india.json      # India NGO directory (teammate fills via GitHub mobile)
│   └── legal_india.md       # India legal steps (teammate fills)
├── translations/
│   ├── es.json         # Spanish UI strings
│   ├── en.json         # English UI strings
│   └── hi.json         # Hindi UI strings (teammate fills — Phase 2)
├── vercel.json         # Vercel config (routes api/ correctly)
├── package.json        # Minimal — only node-fetch if needed
└── .gitignore          # node_modules, .env
```

### Environment variables (set in Vercel dashboard, never in code)

| Variable | Value | Used in |
|---|---|---|
| `HIVE_API_KEY` | Bearer token from hivemoderation.com | `api/detect.js` |
| `AZURE_KEY` | Azure Content Safety key (fallback) | `api/detect.js` |
| `AZURE_ENDPOINT` | Azure endpoint URL | `api/detect.js` |
| `GOOGLE_SERVICE_ACCOUNT` | JSON string of service account credentials | `api/detect.js` |
| `SHEETS_ID` | Google Sheets document ID | `api/detect.js` |

### Security
- Hive API key is **never** in frontend code — only `api/detect.js` (serverless)
- No user data collected — upload is processed in memory, never saved to disk
- Google Sheets log contains: timestamp, country_guess (from Accept-Language header), score_bucket (low/medium/high), result_label — NO filename, NO image data, NO IP address
- CORS: `api/detect.js` returns `Access-Control-Allow-Origin: *` (public tool)
- File size limit: 10MB enforced client-side before upload, 10MB enforced server-side

### Cost estimate (Year 1)
| Item | Cost |
|---|---|
| Vercel hosting | $0 (free tier) |
| Hive API | $0 (100 calls/day free) |
| Azure fallback | $0 (5,000 calls/month free) |
| Google Sheets | $0 |
| GitHub | $0 |
| Domain (optional) | $12/year |
| **Total** | **$0–$12** |

---

## 3. Data Model

### Anonymous log entry (Google Sheets row)

| Field | Type | Example | Notes |
|---|---|---|---|
| `timestamp` | ISO string | `2026-09-08T14:23:11Z` | UTC |
| `country_guess` | string | `MX` | From `Accept-Language` header — 2-letter code |
| `score_bucket` | string | `high` | `low` (0–30), `medium` (31–69), `high` (70–100) |
| `result_label` | string | `likely_fake` | `likely_real`, `uncertain`, `likely_fake` |
| `language` | string | `es` | User's selected language |
| `detection_source` | string | `hive` | `hive` or `azure` (which API responded) |

**No PII. No filename. No image hash. No IP address.**

### NGO data structure (`ngos_mexico.json`, `ngos_india.json`)

```json
[
  {
    "id": "red-infancia-mx",
    "name": "Red Infancia MX",
    "country": "MX",
    "phone": "+52-55-XXXX-XXXX",
    "website": "https://redinfanciamx.org",
    "description_es": "Organización que protege los derechos digitales de menores en México.",
    "description_en": "Organization protecting digital rights of minors in Mexico.",
    "description_hi": ""
  }
]
```

### Translation string structure (`es.json`, `en.json`, `hi.json`)

```json
{
  "hero_title": "¿Es real esta imagen?",
  "hero_subtitle": "Sube una foto o video para descubrir si fue creada por IA.",
  "upload_cta": "Subir imagen",
  "analyzing": "Analizando...",
  "result_likely_fake": "Probablemente generada por IA",
  "result_uncertain": "No podemos determinarlo con certeza",
  "result_likely_real": "Probablemente real",
  "crisis_title": "¿Qué puedes hacer?",
  "step_1": "Guarda evidencia: toma una captura de pantalla con la URL visible.",
  "step_2": "No compartas el contenido — reportarlo a quienes necesitan verlo es suficiente.",
  "step_3": "Contacta a una organización de apoyo:",
  "privacy_note": "No guardamos tu imagen ni ningún dato personal.",
  "lang_toggle_label": "Idioma"
}
```

---

## 4. API Specification

### POST /api/detect

**Purpose:** Receive uploaded file, call Hive API, return score and crisis data.

**Request:**
```
Content-Type: multipart/form-data
Body:
  - file: binary image (jpg/png/webp/gif, max 10MB)
  - country: string ("MX" | "IN" | "other")
  - language: string ("es" | "en" | "hi")
```

**Response (success):**
```json
{
  "score": 0.87,
  "score_percent": 87,
  "label": "likely_fake",
  "bucket": "high",
  "source": "hive",
  "message_key": "result_likely_fake"
}
```

**Response (error):**
```json
{
  "error": true,
  "code": "HIVE_QUOTA_EXCEEDED",
  "fallback_attempted": true,
  "message": "Detection service temporarily unavailable. Try again in a few minutes."
}
```

**Logic flow:**
1. Validate file type and size (reject if > 10MB or not an image MIME type)
2. Call Hive AI deepfake detection endpoint with image binary
3. If Hive returns 429 (quota) or 5xx → try Azure Content Safety fallback
4. If both fail → return error JSON (do not crash)
5. Async (non-blocking): append row to Google Sheets log
6. Return score JSON to frontend

**Hive API call:**
```
POST https://api.thehive.ai/api/v2/task/sync/deepfake_detection
Authorization: Token {HIVE_API_KEY}
Content-Type: multipart/form-data
Body: { media: <file binary> }
```

**Hive response shape (relevant fields):**
```json
{
  "status": [{ "response": { "output": [{ "classes": [{ "class": "ai-generated", "score": 0.87 }] }] } }]
}
```
Extract: `status[0].response.output[0].classes.find(c => c.class === 'ai-generated').score`

---

## 5. User Stories

### US-001 — Upload and detect
**As a** teen who suspects she appears in a deepfake,  
**I want to** upload an image and get a score in seconds,  
**So that** I know whether the media is likely AI-generated without needing an account.

**Acceptance criteria:**
- [ ] Upload button visible on first screen, no login required
- [ ] Accepts jpg, png, webp, gif
- [ ] Shows loading indicator within 200ms of upload
- [ ] Score displayed within 5 seconds of upload (or error message)
- [ ] Score shown as percentage (87%) and plain-language label

### US-002 — Understand the result
**As a** teen with no technical background,  
**I want to** understand what the score means in plain language,  
**So that** I know how seriously to take the result.

**Acceptance criteria:**
- [ ] Score < 30%: green indicator + "This image appears to be real"
- [ ] Score 31–69%: amber indicator + "We can't determine this with certainty"
- [ ] Score ≥ 70%: red indicator + "This image was likely created by AI"
- [ ] All three states shown in the user's selected language

### US-003 — Crisis pathway
**As a** teen who received a high-risk score,  
**I want to** see specific steps I can take right now,  
**So that** I don't feel alone and know what to do.

**Acceptance criteria:**
- [ ] 3 numbered steps displayed below the result for high/medium scores
- [ ] Steps are in the user's selected language
- [ ] At least one NGO contact card shown (phone + website link)
- [ ] NGO card matches user's selected country

### US-004 — Language selection
**As a** Spanish-speaking or Hindi-speaking user,  
**I want to** use the app entirely in my language,  
**So that** I can understand the result and crisis steps without translation.

**Acceptance criteria:**
- [ ] Language toggle visible at top of page (ES / EN / HI)
- [ ] Switching language updates all visible text immediately (no page reload)
- [ ] Default language detected from browser's Accept-Language header
- [ ] Language selection persists if user reloads page (localStorage)

### US-005 — Privacy assurance
**As a** teen afraid of her data being seen,  
**I want to** know that my image is not saved,  
**So that** I feel safe using the tool.

**Acceptance criteria:**
- [ ] Privacy note visible on upload screen before action: "We don't save your image or any personal data"
- [ ] Note shown again on result screen
- [ ] Privacy note text is in the user's selected language

---

## 6. Functional Requirements

### FR-001 — File upload component
**Priority:** P0  
**Description:** Drag-and-drop area + click-to-browse button. Accepts image files only.  
**Acceptance criteria:**
- Accepts: jpg, jpeg, png, webp, gif
- Rejects: pdf, mp4, and any non-image MIME type with a clear error message
- Max file size: 10MB — client-side check before upload, error shown inline
- Shows filename and file size after selection, before submission
- "Analyze" button activates only after valid file selected

### FR-002 — Detection API call
**Priority:** P0  
**Description:** Frontend POSTs file to `/api/detect`, receives JSON score.  
**Acceptance criteria:**
- Loading spinner shown while waiting
- Timeout after 22 seconds (client) / server function budget 20 seconds — show "Taking longer than expected. Please try again."
- Network error → "Could not connect. Check your internet and try again."
- API error (Hive quota) → "Detection temporarily unavailable. Try again in a few minutes."

### FR-003 — Score display
**Priority:** P0  
**Description:** Large percentage number with color-coded label and plain-language text.  
**Acceptance criteria:**
- Score number displayed in JetBrains Mono, minimum 48px, color matches bucket
- Label displayed below score in Inter, sentence-case
- Color: teal (≤30%), amber (31–69%), red (≥70%)
- Score animates from 0 to final value over 800ms (CSS counter animation)

### FR-004 — Crisis pathway cards
**Priority:** P0  
**Description:** 3 numbered steps shown below result for medium and high scores.  
**Acceptance criteria:**
- Shown automatically for score ≥ 31%
- Steps pulled from translation JSON for the current language
- Mexico NGO card shown if country = MX
- India NGO card shown if country = IN
- General card shown for country = other

### FR-005 — Language toggle
**Priority:** P0  
**Description:** Button group at top of page — ES / EN / HI  
**Acceptance criteria:**
- Active language highlighted with teal accent
- Switching language re-renders all text strings from translation JSON
- No page reload required
- HI button labeled "हि" (Devanagari)
- Selected language saved to localStorage key `vs_lang`

### FR-006 — Country selector
**Priority:** P1 (Phase 2)  
**Description:** Simple two-button selector: 🇲🇽 México / 🇮🇳 India / 🌐 Other  
**MVP behavior:** Auto-guess from Accept-Language header and show relevant card. Explicit selector in Phase 2.

### FR-007 — Anonymous logging
**Priority:** P1  
**Description:** After each detection, append one row to Google Sheets.  
**Acceptance criteria:**
- Log call is async — does not delay the response to user
- If log fails (Sheets API error), fail silently — user never sees logging errors
- Logged fields: timestamp, country_guess, score_bucket, result_label, language, detection_source
- No PII logged — no filename, no image data, no IP

### FR-008 — Privacy note
**Priority:** P0  
**Description:** Short statement visible before upload and after result.  
**Acceptance criteria:**
- Text: translation key `privacy_note` — "We don't save your image or any personal data."
- Shown on upload screen below the upload button
- Shown on result screen below the NGO cards

---

## 7. Non-Functional Requirements

| Requirement | Threshold | How verified |
|---|---|---|
| Detection response time | < 5 seconds P95 | Manual timing on 3G mobile |
| Page load (first contentful paint) | < 2 seconds on 3G | Lighthouse mobile |
| Mobile layout | Works on 320px–428px viewport | Chrome DevTools responsive |
| Accessibility | WCAG AA contrast for all text | Lighthouse accessibility |
| Uptime | Vercel free tier SLA (~99.9%) | Vercel dashboard |
| API key exposure | Zero — never in frontend bundle | Manual code review |
| PII in logs | Zero — verified per row | Manual Sheets audit |
| Error recovery | All API failures show user-friendly message | Manual test each failure mode |

---

## 8. UI/UX Requirements

### Screen 1 — Home / Upload

**Layout (top → bottom):**
1. Language toggle (ES / EN / HI) — top right, always visible
2. VeraShield wordmark — Syne Bold, 28px, white
3. Hero headline — translation key `hero_title`, Syne 800, 36px, white
4. Hero subtitle — translation key `hero_subtitle`, Inter 400, 16px, muted
5. Upload zone — dashed border, `--radius-lg`, full width on mobile, max 480px centered on desktop
   - Icon: camera/upload SVG, 40px, teal
   - Text: "Tap to upload or drag an image here", muted
   - After selection: filename + size displayed, teal check icon
6. Country selector (MVP: hidden, auto-detected. Phase 2: 🇲🇽 / 🇮🇳 / 🌐 button group)
7. "Analyze" primary button — full width, teal bg, white text, 52px height
8. Privacy note — Inter 12px, muted, centered

**States:**
- Default: upload zone idle, Analyze button disabled
- File selected: filename shown, Analyze button enabled
- Uploading: Analyze button becomes loading spinner, disabled

### Screen 2 — Result

**Layout (replaces Screen 1 content after result):**
1. Language toggle (persists)
2. Score display — JetBrains Mono, 72px, color-coded
3. Score label — translation key per bucket, Inter 600, 18px, same color as score
4. Plain-language explanation — 1–2 sentences, Inter 400, 16px, muted
5. Divider
6. Crisis pathway section (if score ≥ 31%):
   - Section header: translation key `crisis_title`, Inter 600, 16px, teal
   - 3 numbered steps as `<ol>` — Inter 400, 15px, white
   - NGO card: surface bg, teal border-left, NGO name (bold), phone (link), website (link)
7. Privacy note (repeated)
8. "Analyze another image" secondary button — ghost style, full width

**States:**
- Loading: full-screen centered spinner with "Analyzing..." text
- Error: red icon + error message + "Try again" button
- Low risk (< 30%): teal score, calm reassuring message
- Medium risk (31–69%): amber score, cautious message, crisis steps shown
- High risk (≥ 70%): red score, clear message, crisis steps prominently shown

### Responsive breakpoints
- Mobile-first base: 320px–640px — single column, full-width elements
- Tablet/desktop (> 640px): content max-width 640px, centered, same layout

---

## 9. Design System (CSS variables + implementation)

```css
/* styles.css — paste at top */
:root {
  /* Colors */
  --color-bg:       #0B1929;
  --color-surface:  #132238;
  --color-accent:   #00C9B1;
  --color-amber:    #F5A623;
  --color-red:      #E84855;
  --color-text:     #E2E8F0;
  --color-muted:    #94A3B8;
  --color-white:    #FFFFFF;
  --color-border:   #1E3352;

  /* Score bucket colors */
  --score-low:      var(--color-accent);
  --score-medium:   var(--color-amber);
  --score-high:     var(--color-red);

  /* Typography */
  --font-display:   'Syne', sans-serif;
  --font-body:      'Inter', sans-serif;
  --font-mono:      'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-6: 24px;  --space-8: 32px;
  --space-12: 48px; --space-16: 64px;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Layout */
  --max-width: 640px;
}

/* Base reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); min-height: 100vh; }
```

---

## 10. Auth Implementation

**None required.** The app is intentionally public and requires no login. Minors must not be required to create accounts to use a crisis tool. No session management, no cookies beyond localStorage for language preference.

---

## 11. Payment Integration

**None in MVP.** Freemium model tracked manually. Payment UI added post-Conrad if NGO pipeline is established.

---

## 12. Edge Cases & Error Handling

| Scenario | Expected behavior |
|---|---|
| File too large (> 10MB) | Client-side: "File too large. Max size is 10MB." before upload |
| Non-image file type | Client-side: "Please upload an image file (JPG, PNG, or WebP)." |
| Hive API 429 (quota exceeded) | Try Azure fallback. If Azure also fails: "Detection temporarily unavailable." |
| Hive API 5xx | Try Azure fallback. Log failure silently. |
| Both APIs fail | Show: "Our detection service is temporarily unavailable. Try again in a few minutes." Do NOT crash. |
| Google Sheets log fails | Fail silently. Log error to console only. User experience unchanged. |
| User has no internet | Fetch timeout at 22s → "Could not connect. Please check your connection." |
| Browser blocks file access | Upload zone shows file picker as fallback (no drag-and-drop required) |
| Accept-Language header missing | Default to English |
| hi.json not yet populated | Fall back to en.json strings — no broken UI |

---

## 13. Dependencies & Integrations

| Dependency | Type | Install |
|---|---|---|
| Hive AI deepfake detection | External API | No install — HTTP call from serverless |
| Azure AI Content Safety | External API | No install — HTTP call from serverless |
| Google Sheets API v4 | External API | `npm install googleapis` |
| Vercel | Hosting + serverless | Vercel CLI: `npm i -g vercel` |
| Google Fonts (Syne, Inter, JetBrains Mono) | CSS CDN | `<link>` in HTML |

**`package.json` (minimal):**
```json
{
  "name": "verashield",
  "version": "1.0.0",
  "dependencies": {
    "googleapis": "latest"
  }
}
```

---

## 14. Out of Scope (MVP)

- User accounts or any authentication
- Hindi UI (translations/hi.json content — teammate's Phase 2 deliverable)
- Explicit country selector UI (auto-detected in MVP)
- Video deepfake detection
- NGO directory with full search/filter
- Payment or subscription management
- Admin dashboard or usage analytics UI
- Email notifications
- App Store / Google Play app
- Multi-image batch detection

---

## 15. Open Questions

- [ ] Does Hive API return a confidence score for still images specifically, or only video? (Verify on first test run)
- [ ] What is the exact Google Sheets API scope needed — `spreadsheets` or `spreadsheets.readonly`? (Use `spreadsheets` for append)
- [ ] Should the crisis pathway show for ALL scores, or only medium/high? (Current decision: show for ≥ 31%)
- [ ] When Hindi content is ready from teammate, does Devanagari script render correctly in JetBrains Mono? (Fallback to Inter for Hindi if not)
- [ ] Should "Analyze another image" reset the page or just clear the result section? (Reset full page for MVP simplicity)
