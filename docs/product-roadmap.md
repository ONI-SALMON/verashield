# VeraShield — Product Roadmap

**Target:** MVP live on Vercel by Sept 8, 2026  
**Build tool:** Claude Code (Plaid)  
**Stack:** Vanilla HTML/CSS/JS + Vercel serverless (Node.js)

---

## Build Philosophy

1. **Get the magic moment first.** Upload → score → crisis steps. Everything else is polish.
2. **No broken states.** Each phase ends with a fully working, deployable app.
3. **Mobile-first always.** Test every change at 375px viewport before desktop.
4. **Environment variables from day one.** Never hardcode keys, even in dev.
5. **Teammate-ready structure.** Empty JSON files committed to repo so India contributor can start filling without waiting for the app to be "done."

---

## Phase 1 — Foundation & Scaffolding

**Goal:** Repo connected to Vercel, design system in place, page loads with correct layout.  
**Demoable:** A beautiful empty shell at your Vercel URL.  
**Time estimate:** 1–2 hours

**Session prompt for Claude Code:**
> "Read docs/prd.md and docs/product-vision.md. Set up the VeraShield project: create the full repo structure defined in the PRD, implement the CSS design system with all variables, build the HTML skeleton for Screen 1 (upload screen), and connect the Google Fonts. Do not implement any JavaScript yet. Follow the PRD exactly."

---

- [x] **TASK-001** — Create repo file structure  
  Files: `index.html`, `styles.css`, `app.js`, `vercel.json`, `package.json`, `.gitignore`, `api/detect.js`, `data/ngos_mexico.json`, `data/ngos_india.json`, `translations/es.json`, `translations/en.json`, `translations/hi.json`  
  Notes: `app.js` and `api/detect.js` should be empty stubs. JSON files should be empty arrays `[]`. `.gitignore` must include `node_modules/` and `.env`. `vercel.json` content: `{"functions": {"api/*.js": {"maxDuration": 15}}}`

- [x] **TASK-002** — Implement CSS design system  
  Files: `styles.css`  
  Notes: Paste the full `:root` block from PRD Section 9. Add base reset. Add `body` with `background: var(--color-bg)`, `color: var(--color-text)`, font-family body. Add Google Fonts `<link>` to index.html: Syne (700,800), Inter (400,500,600), JetBrains Mono (400,600).

- [x] **TASK-003** — Build HTML skeleton (Screen 1 — upload)  
  Files: `index.html`  
  Notes: Structure per PRD Section 8 Screen 1. Language toggle as `<div class="lang-toggle">` with three `<button>` elements (ES, EN, HI). Upload zone as `<div class="upload-zone">` with drag-drop area. "Analyze" button as `<button id="analyze-btn" disabled>`. Privacy note as `<p class="privacy-note">`. All text should use hardcoded English strings for now — translation wiring comes in TASK-007.

- [x] **TASK-004** — Style Screen 1  
  Files: `styles.css`  
  Notes: Upload zone: dashed `2px var(--color-border)` border, `var(--radius-lg)`, min-height 160px, centered content, teal camera icon (SVG inline or CSS). Analyze button: `background: var(--color-accent)`, `color: var(--color-bg)`, full width, 52px height, `var(--radius-sm)`, `font-family: var(--font-body)`, `font-weight: 600`. Lang toggle buttons: `background: transparent`, `color: var(--color-muted)`, active state gets `color: var(--color-accent)` and `border-bottom: 2px solid var(--color-accent)`. Max content width 640px, centered.

- [ ] **TASK-005** — Set up Vercel project  
  Files: `vercel.json`  
  Notes: Run `vercel` in project root to link. Set environment variables in Vercel dashboard: `HIVE_API_KEY`, `AZURE_KEY`, `AZURE_ENDPOINT`, `GOOGLE_SERVICE_ACCOUNT`, `SHEETS_ID`. Do NOT put these in `.env` in the repo — set them via `vercel env add` or the dashboard. Confirm `vercel dev` runs locally.

- [x] **TASK-006** — Install dependencies  
  Files: `package.json`  
  Notes: Run `npm install googleapis`. This is the only dependency needed for Google Sheets logging. Commit `package-lock.json`.

---

## Phase 2 — Core Detection (Magic Moment)

**Goal:** Upload image → Hive API call → score displayed on screen.  
**Demoable:** The full magic moment works end-to-end.  
**Time estimate:** 2–3 hours

**Session prompt for Claude Code:**
> "Read docs/prd.md. Implement the detection pipeline: (1) build api/detect.js as specified in PRD Section 4, (2) implement the frontend upload flow in app.js as specified in PRD Section 8 and FR-001/FR-002, (3) build and style Screen 2 (result screen) per PRD Section 8. The Hive API key is in the HIVE_API_KEY environment variable. Do not implement Google Sheets logging yet — stub it as a console.log. Follow the PRD exactly."

---

- [x] **TASK-007** — Build `api/detect.js` — Hive API integration  
  Files: `api/detect.js`  
  Notes: Use Node.js built-in `fetch` (Node 18+ available on Vercel). Parse incoming FormData with Vercel's built-in body parser. Call Hive endpoint: `POST https://api.thehive.ai/api/v2/task/sync/deepfake_detection` with `Authorization: Token ${process.env.HIVE_API_KEY}`. Extract `ai-generated` class score from response as described in PRD Section 4. Map score to bucket (low/medium/high) and label (likely_real/uncertain/likely_fake). Return JSON `{score, score_percent, label, bucket, source: 'hive'}`. Wrap entire function in try/catch — on any error return `{error: true, code: 'DETECTION_FAILED', message: '...'}`.

- [x] **TASK-008** — Add Azure fallback to `api/detect.js`  
  Files: `api/detect.js`  
  Notes: If Hive returns 429 or 5xx, retry with Azure Content Safety API. Azure endpoint pattern: `${process.env.AZURE_ENDPOINT}/contentsafety/image:analyze?api-version=2023-10-01`. Header: `Ocp-Apim-Subscription-Key: ${process.env.AZURE_KEY}`. If Azure also fails, return error JSON per PRD Section 12. Set `source: 'azure'` in response when fallback is used.

- [x] **TASK-009** — Frontend: file upload logic  
  Files: `app.js`  
  Notes: Add drag-and-drop listeners to `.upload-zone`. Add `change` listener to hidden `<input type="file">`. Validate file type (accept only image/* MIME types) — show inline error if invalid per FR-001. Validate file size ≤ 10MB — show inline error if too large. On valid file: show filename + size, enable `#analyze-btn`, store File object in module variable `selectedFile`.

- [x] **TASK-010** — Frontend: POST to /api/detect and handle response  
  Files: `app.js`  
  Notes: On `#analyze-btn` click: build FormData with `selectedFile`, `country` (from auto-detect or default 'MX'), `language` (current selected). Show loading state (spinner, disable button). `fetch('/api/detect', {method: 'POST', body: formData})` with 22-second timeout (use AbortController). On success: call `showResult(data)`. On network error or timeout: call `showError('network')`. On API error in JSON: call `showError(data.code)`.

- [x] **TASK-011** — Build HTML for Screen 2 (result screen)  
  Files: `index.html`  
  Notes: Add a `<section id="result-screen" hidden>` below Screen 1 section. Inside: score display `<div class="score-display">` with `<span id="score-number">` and `<span id="score-label">`. Below: `<div class="score-explanation" id="score-explanation">`. Then `<div class="crisis-pathway" id="crisis-pathway">` for steps + NGO card. Then privacy note (repeated). Then "Analyze another image" `<button id="reset-btn">`. Per PRD Section 8 Screen 2 layout exactly.

- [x] **TASK-012** — Style Screen 2  
  Files: `styles.css`  
  Notes: Score number: `font-family: var(--font-mono)`, `font-size: clamp(56px, 15vw, 88px)`, `font-weight: 600`. Score color: use `data-bucket` attribute on `.score-display` — CSS `[data-bucket="low"]` → `var(--score-low)`, `[data-bucket="medium"]` → `var(--score-medium)`, `[data-bucket="high"]` → `var(--score-high)`. Score animates from 0 to value using CSS `@property` counter animation or JS `requestAnimationFrame`. Crisis pathway: each step as `<li>` with teal number circle. NGO card: `background: var(--color-surface)`, `border-left: 3px solid var(--color-accent)`, `var(--radius-md)`, padding `var(--space-4)`.

- [x] **TASK-013** — `showResult()` and `showError()` functions  
  Files: `app.js`  
  Notes: `showResult(data)`: hide Screen 1, show Screen 2. Set `#score-number` to `data.score_percent`. Set `data-bucket` on `.score-display`. Set `#score-label` and `#score-explanation` from hardcoded English strings (translation wiring in TASK-017). If `data.bucket !== 'low'`, show `#crisis-pathway` with Mexico placeholder steps. `showError(code)`: hide spinner, show inline error message per PRD Section 12 error table. Re-enable analyze button.

---

## Phase 3 — Translation System

**Goal:** All visible text driven by translation JSON. Language toggle works fully.  
**Demoable:** Full ES/EN toggle working end-to-end on both screens.  
**Time estimate:** 1–2 hours

**Session prompt for Claude Code:**
> "Read docs/prd.md Section 3 (translation string structure) and Section 6 FR-005. Implement the full translation system in app.js: load the correct JSON file based on selected language, replace all hardcoded strings with translation keys, and wire up the language toggle buttons. Also populate es.json and en.json with all required string keys."

---

- [ ] **TASK-014** — Populate `translations/es.json`  
  Files: `translations/es.json`  
  Notes: Fill all keys from PRD Section 3 translation structure. Spanish strings. Include: `hero_title`, `hero_subtitle`, `upload_cta`, `upload_prompt`, `analyzing`, `result_likely_fake`, `result_uncertain`, `result_likely_real`, `score_explanation_fake`, `score_explanation_uncertain`, `score_explanation_real`, `crisis_title`, `step_1`, `step_2`, `step_3`, `privacy_note`, `lang_toggle_label`, `error_file_too_large`, `error_invalid_type`, `error_network`, `error_unavailable`, `reset_btn`, `ngo_call_label`, `ngo_visit_label`.

- [ ] **TASK-015** — Populate `translations/en.json`  
  Files: `translations/en.json`  
  Notes: Same keys as es.json, English strings. `hi.json` stays empty array — teammate fills it.

- [ ] **TASK-016** — Translation loader function  
  Files: `app.js`  
  Notes: `async function loadTranslations(lang)`: fetch `./translations/${lang}.json`. Cache result in a module-level object `const t = {}`. If fetch fails or json is empty, fall back to `en.json`. Export `function tr(key)` that returns `t[key] || key` (key as fallback, never undefined).

- [ ] **TASK-017** — Wire all UI strings to translation system  
  Files: `app.js`, `index.html`  
  Notes: Add `data-i18n="key"` attribute to every text element in index.html. In app.js, after loading translations: `document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = tr(el.dataset.i18n))`. Also update `aria-label` attributes using `data-i18n-aria`. Call this after every language switch.

- [ ] **TASK-018** — Language toggle logic  
  Files: `app.js`  
  Notes: Add click listeners to all three lang buttons. On click: set `localStorage.setItem('vs_lang', lang)`. Call `await loadTranslations(lang)` then re-render all `[data-i18n]` elements. Update active button styling by toggling `.active` class. On page load: read `localStorage.getItem('vs_lang')` → fallback to browser `navigator.language.split('-')[0]` → fallback to `'en'`.

---

## Phase 4 — Crisis Pathway & NGO Data

**Goal:** Country-specific crisis steps and NGO cards shown after detection.  
**Demoable:** MX user sees Spanish legal steps + Red Infancia MX card. IN user sees India steps + Cyber Peace Foundation card.  
**Time estimate:** 1–2 hours

**Session prompt for Claude Code:**
> "Read docs/prd.md Sections 3 (NGO data structure), 6 (FR-004, FR-006), and 8 (Screen 2 crisis pathway). Implement: (1) populate data/ngos_mexico.json with placeholder Mexico NGOs, (2) build the renderCrisisPathway(country, lang) function that shows the correct steps and NGO card, (3) auto-detect country from Accept-Language header in api/detect.js and return it in the response."

---

- [ ] **TASK-019** — Populate `data/ngos_mexico.json`  
  Files: `data/ngos_mexico.json`  
  Notes: Add at minimum: Red Infancia MX (placeholder contact until real email confirmed), DIF Nacional (01800-INFANCIA), CNDH (55-1719-2000). Use the schema from PRD Section 3. `description_hi` can be empty string for now.

- [ ] **TASK-020** — Add country detection to `api/detect.js`  
  Files: `api/detect.js`  
  Notes: Read `Accept-Language` header from request. Extract 2-letter country code: `'es-MX'` → `'MX'`, `'hi-IN'` or `'en-IN'` → `'IN'`. Add `country_guess` to the response JSON. Also log country_guess to console for now (Sheets logging in next task).

- [ ] **TASK-021** — Build `renderCrisisPathway(country, lang)` function  
  Files: `app.js`  
  Notes: Called after `showResult()` when bucket is medium or high. Fetch `./data/ngos_${country.toLowerCase()}.json` (or `ngos_mexico.json` as fallback). Render numbered steps from translation keys `step_1`, `step_2`, `step_3`. Render NGO card for the first NGO in the array: name (bold), phone as `<a href="tel:...">`, website as `<a href="..." target="_blank">`. If NGO JSON is empty or fetch fails, show only the steps (no card) — do not break.

- [ ] **TASK-022** — Add "General" crisis card fallback  
  Files: `app.js`, `translations/es.json`, `translations/en.json`  
  Notes: If country is not MX or IN, show a general card with translation key `ngo_general_title` and `ngo_general_text` (e.g., "Talk to a trusted adult at your school or contact your country's national child protection helpline."). Add these keys to both translation files.

---

## Phase 5 — Anonymous Logging

**Goal:** Every detection appends one anonymous row to Google Sheets.  
**Demoable:** After a detection, check the Google Sheet — new row appears within 2 seconds.  
**Time estimate:** 1 hour

**Session prompt for Claude Code:**
> "Read docs/prd.md Section 3 (log entry schema) and FR-007. Implement Google Sheets anonymous logging in api/detect.js. Use the googleapis package with service account credentials from the GOOGLE_SERVICE_ACCOUNT environment variable. The Sheets document ID is in SHEETS_ID. Logging must be async and never block the response to the user."

---

- [ ] **TASK-023** — Implement Google Sheets logging in `api/detect.js`  
  Files: `api/detect.js`  
  Notes: `const { google } = require('googleapis')`. Parse `JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)` for credentials. Authenticate with `google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })`. Use `sheets.spreadsheets.values.append` with `range: 'Sheet1!A:F'`, `valueInputOption: 'RAW'`. Row values: `[timestamp, country_guess, score_bucket, result_label, language, detection_source]`. Wrap in try/catch — on error, `console.error` only, do NOT rethrow. Call this AFTER sending response to user (use `res.end()` then call logging, or fire-and-forget with `.catch(console.error)`).

- [ ] **TASK-024** — Verify logging in production  
  Files: none (verification step)  
  Notes: Deploy to Vercel. Run 3 detections. Open the Google Sheet. Confirm 3 rows appeared with correct fields. Confirm no PII (no filename, no image hash, no IP). Confirm logging failure (temporarily invalid Sheets ID) does not affect user-facing response.

---

## Phase 6 — Polish & Launch

**Goal:** App is production-ready: accessible, performant, error-proof, and ready for Conrad judges.  
**Demoable:** Full end-to-end on real mobile phone, all error states handled, privacy note visible.  
**Time estimate:** 1–2 hours

**Session prompt for Claude Code:**
> "Read docs/prd.md Sections 7 (NFRs), 8 (UI/UX requirements for all states), and 12 (error handling). Implement: (1) all loading and error states per the PRD, (2) accessibility improvements (aria-live, focus management, keyboard navigation), (3) score counter animation, (4) final mobile layout fixes. Run through every error scenario in Section 12 and confirm each one shows the correct user message."

---

- [ ] **TASK-025** — Implement all error states  
  Files: `app.js`, `styles.css`  
  Notes: Per PRD Section 12: file too large → inline error below upload zone. Invalid file type → inline error. Network timeout (22s) → error screen with retry button. API unavailable → error screen with retry button. All error messages use translation keys. Error state resets correctly when user clicks retry.

- [ ] **TASK-026** — Implement score counter animation  
  Files: `app.js`, `styles.css`  
  Notes: Use `requestAnimationFrame` to animate score number from 0 to final value over 800ms. Easing: ease-out. Score color should be the final bucket color from the start (not animate through colors). Respect `prefers-reduced-motion: reduce` — if set, show final score immediately with no animation.

- [ ] **TASK-027** — Accessibility pass  
  Files: `index.html`, `app.js`, `styles.css`  
  Notes: Add `aria-live="polite"` to result container — screen reader announces score. Add `aria-label` to language toggle buttons: "Switch to Spanish", "Switch to English", "Switch to Hindi". Ensure `:focus-visible` outline on all interactive elements (2px solid `var(--color-accent)`, 2px offset). Upload zone must be keyboard-activatable (add `tabindex="0"` and `keydown` Enter/Space handler). Test with VoiceOver (iOS) or TalkBack (Android).

- [ ] **TASK-028** — Performance check  
  Files: `index.html`, `styles.css`  
  Notes: Add `loading="lazy"` to any images. Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`. Confirm Lighthouse mobile score ≥ 90 performance. Confirm first contentful paint < 2s on simulated 3G.

- [ ] **TASK-029** — Create teammate-ready empty files  
  Files: `data/ngos_india.json`, `translations/hi.json`  
  Notes: Commit `data/ngos_india.json` as `[]` (empty array matching schema). Commit `translations/hi.json` as `{}` (empty object). Commit `data/legal_india.md` as a template with section headers teammate can fill. These files must exist in the repo so teammate can edit them via GitHub mobile editor without needing to create files.

- [ ] **TASK-030** — Final deploy & smoke test  
  Files: none (verification step)  
  Notes: Push to `main` → confirm Vercel auto-deploys. Test on a real Android phone (Chrome) and iOS (Safari): upload a real photo, confirm score appears in < 5 seconds. Test language toggle ES ↔ EN. Test error state (upload a PDF — should show error). Share URL with teammate to test on his phone in India. Confirm Google Sheets log has entries.

---

## Agent Session Guide

**How to structure your Claude Code sessions:**

Each phase above has a **session prompt** — copy it exactly into Claude Code at the start of that session. The prompt tells Claude Code to read the PRD first, so it has full context before touching any code.

**Session rhythm:**
1. Start with the session prompt for that phase
2. Let Claude Code complete all tasks in the phase
3. Test manually before moving to the next phase
4. Each phase ends with a working, deployed app — never leave a phase with a broken deploy

**Checking in with teammate:**
- After TASK-029: share the repo link and confirm teammate can edit the empty JSON files from his phone
- After TASK-030: share the Vercel URL and ask teammate to test on his phone in India

**When something breaks:**
- Paste the error message into Claude Code with: "This error appeared. The relevant file is [filename]. Fix it per the PRD."
- Do not move to the next phase until the current phase is fully working

**Environment variables reminder:**
Never put API keys in code. Always use `process.env.VARIABLE_NAME` in `api/detect.js` and set values in Vercel dashboard or via `vercel env add`.
