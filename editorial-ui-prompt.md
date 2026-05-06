# Editorial Magazine UI — Design Prompt

> **Style:** Editorial / Print-magazine-on-the-web
> **Aesthetic:** Sparse, typographic, unhurried. No gradients. No card shadows. No SaaS energy.
> **Reference inspiration:** GSoCDex (gsoc-dex.vercel.app)

Replace every `[PLACEHOLDER]` below before using this prompt.

---

## How to use this file

1. Fill in every `[PLACEHOLDER]` with your own content.
2. Copy the final prompt (everything under **"— PROMPT START —"**) into Claude, v0, Cursor, or any code-generation tool.
3. The prompt is self-contained — no prior context needed.

---

## Placeholder Reference

| Placeholder | What to put here |
|---|---|
| `[APP_NAME]` | Your app/site name, e.g. `GSoCDex`, `PortfolioDex`, `LegalDex` |
| `[APP_TAGLINE]` | One-line description, e.g. `Every accepted GSoC proposal, browsable.` |
| `[ACCENT_WORD]` | The one italic orange word in the hero heading, e.g. `proposal.`, `case.`, `entry.` |
| `[HERO_LINE_1]` | First line of the giant hero heading, e.g. `Every accepted` |
| `[HERO_LINE_2]` | Second line, e.g. `GSoC [ACCENT_WORD]` |
| `[HERO_LINE_3]` | Third line, e.g. `Browsable.` |
| `[HERO_SUBTITLE]` | 1–2 sentence subtitle below the hero heading |
| `[STAT_1]` | First stat, e.g. `117 proposals` |
| `[STAT_2]` | Second stat, e.g. `7 years` |
| `[STAT_3]` | Third stat, e.g. `84 orgs` |
| `[VOL_LABEL]` | Eyebrow label, e.g. `THE GSOC PROPOSAL CATALOG · VOL. 01` |
| `[SECTION_1_MARKER]` | Section marker, e.g. `§ I — THE LEDGER` |
| `[SECTION_1_HEADING]` | Section H2, e.g. `Browse the catalog` |
| `[FILTER_GROUP_1]` | First filter axis, e.g. `By year` |
| `[FILTER_GROUP_2]` | Second filter axis, e.g. `By organization` |
| `[FILTER_GROUP_3]` | Third filter axis, e.g. `By tech tag` |
| `[SECTION_2_MARKER]` | e.g. `§ II — LATEST ENTRIES` |
| `[SECTION_2_HEADING]` | e.g. `Most recently catalogued` |
| `[ITEM_BADGE]` | 2-letter abbreviation for each list item, e.g. `RO` |
| `[ITEM_ORG]` | Org or category name, e.g. `Rocket.chat` |
| `[ITEM_YEAR]` | Year badge, e.g. `2026` |
| `[ITEM_TITLE]` | The main linked title of each row item |
| `[ITEM_AUTHOR]` | Sub-label, e.g. `by Aryan Verma` |
| `[ITEM_TAG_1]` | Tech/category tag, e.g. `TypeScript` |
| `[ITEM_TAG_2]` | Additional tag |
| `[TOTAL_COUNT]` | Total items count, e.g. `117` |
| `[SECTION_3_MARKER]` | e.g. `§ III — EDITORIAL` |
| `[SECTION_3_HEADING]` | e.g. `Notes for the applicant` |
| `[ARTICLE_DATE]` | e.g. `April 2026` |
| `[ARTICLE_TITLE]` | Editorial article title |
| `[ARTICLE_SUMMARY]` | One-sentence article description |
| `[CTA_PREHEADING]` | Small italic heading above CTA, e.g. `An invitation` |
| `[CTA_HEADING]` | Main CTA heading, e.g. `Submitted a proposal? Add it to the catalog.` |
| `[CTA_SUBTEXT]` | One-line supporting text under CTA |
| `[CTA_BUTTON_LABEL]` | Button text, e.g. `Submit a proposal` |
| `[NAV_LINK_1]` | First nav link label, e.g. `BROWSE` |
| `[NAV_LINK_2]` | Second nav link label, e.g. `TIPS` |
| `[NAV_LINK_3]` | Third nav link label, e.g. `SUBMIT` |
| `[FOOTER_GROUP_1_LABEL]` | Footer column heading, e.g. `Catalog` |
| `[FOOTER_GROUP_2_LABEL]` | e.g. `Editorial` |
| `[FOOTER_GROUP_3_LABEL]` | e.g. `Disclosures` |
| `[FOOTER_DISCLAIMER]` | Small legal note, e.g. `Independent archive. Not affiliated with Google.` |
| `[COPYRIGHT_YEAR]` | e.g. `2026` |
| `[SEARCH_PLACEHOLDER]` | e.g. `Search proposals, orgs, tech tags…` |
| `[LOGO_SVG_PATH]` | Path or URL to your logo SVG, or describe it |
| `[ARTICLE_BODY_MD]` | Full article body in Markdown (for article/tip pages) |
| `[BREADCRUMB_SECTION]` | e.g. `Tips` (for breadcrumb: App / Tips / Article) |

---

&nbsp;

---

# — PROMPT START —

Build a multi-page **editorial magazine-style web app** called **[APP_NAME]** with the tagline *[APP_TAGLINE]*.

The visual language is sparse, typographic, and deliberately unhurried — modeled on a print magazine brought to the web. No gradients. No card drop-shadows. No SaaS dashboard patterns. Think *New York Review of Books* meets a developer archive.

---

## Design System

### Colors
```
Background:       #FBFBF9   (warm off-white, never pure white)
Body text:        #1A1A18   (near-black)
Muted/secondary:  #6B6B63   (warm gray)
Accent:           #C96A1A   (burnt orange — used ONLY for logo wordmark italic + hero accent word)
Borders/dividers: #E5E5DF   (very subtle warm gray)
Tag backgrounds:  #F0F0EA
```

### Typography
- **Hero/display headings:** Playfair Display or Lora (serif), 56–72px desktop / 32–40px mobile, bold, line-height 1.1, no letter-spacing.
- **Body text:** Same serif or transitional serif, 17–18px, line-height 1.75.
- **Labels, tags, nav, metadata:** Inter or DM Sans (sans-serif), 11–12px, UPPERCASE, `letter-spacing: 0.12em`, medium weight.
- **Section markers:** Monospace or tracked sans, small, left-aligned, muted color. Format: `§ I — SECTION NAME`.
- **Italic accent in hero:** One word in the hero heading is `font-style: italic; color: #C96A1A`. Everything else is normal weight dark serif.

### Spacing
- Between sections: `10–16rem` vertical padding.
- Content max-width: `760px` for editorial text, `1100px` for catalog/grid content.
- Default layout is **left-aligned**. Only the hero section is centered.

---

## Pages to Build

### 1. Homepage

**Navbar (sticky, 56px tall):**
- Left: `[LOGO_SVG_PATH]` icon + wordmark. "**[APP_NAME_PART_1]**" in dark serif, "[APP_NAME_PART_2]" in burnt orange `#C96A1A`.
- Center: Search bar — pill shape, subtle `1px` border, `#FBFBF9` fill, placeholder `[SEARCH_PLACEHOLDER]`, keyboard shortcut badge `⌘K` on the right end. Clicking opens a command palette overlay.
- Right: `[NAV_LINK_1]`  `[NAV_LINK_2]`  `[NAV_LINK_3]` — plain uppercase tracked text links, no button styles, no underlines by default.

**Hero Section (centered):**
- Eyebrow: `[VOL_LABEL]` — uppercase, tracked, small, muted, centered.
- Giant serif heading (3 lines, centered):
  ```
  [HERO_LINE_1]
  [HERO_LINE_2] *[ACCENT_WORD]*
  [HERO_LINE_3]
  ```
  Where `[ACCENT_WORD]` is italic and `color: #C96A1A`.
- Subtitle: `[HERO_SUBTITLE]` — body text, centered, max-width 480px, muted color.
- Stat strip: `[STAT_1] · [STAT_2] · [STAT_3]` — uppercase tracked pill row, dots as separators, inline.
- Decorative: faint watermark of the logo SVG behind the hero text, `opacity: 0.04`.

**Section I — Browse:**
- Left-aligned section marker: `[SECTION_1_MARKER]`
- H2: `[SECTION_1_HEADING]` in large serif.
- Top-right: small `View all →` link.
- Three side-by-side columns: `[FILTER_GROUP_1]`, `[FILTER_GROUP_2]`, `[FILTER_GROUP_3]`.
- Each column: small uppercase group label, then a list of items as plain links with a count badge `[N]` in muted color. No bullets, no borders.

**Section II — Latest Entries:**
- Section marker: `[SECTION_2_MARKER]`
- H2: `[SECTION_2_HEADING]`
- Top-right: `All [TOTAL_COUNT] →` link.
- List of item rows (repeat for each item, at least 5 demo entries):
  - Left: 2-letter abbreviation badge `[ITEM_BADGE]` in a small rounded square (serif bold, `#F0F0EA` background), org label `[ITEM_ORG]`, year badge `[ITEM_YEAR]`.
  - Main: H3 serif title as a link `[ITEM_TITLE]`, then `[ITEM_AUTHOR]` in muted small text below.
  - Bottom: tech/category tag pills `[ITEM_TAG_1]` `[ITEM_TAG_2]` — `#F0F0EA` bg, no border, uppercase tracked 11px.
  - Separator: `1px solid #E5E5DF` between rows.
- Below list: `View all [TOTAL_COUNT] items →` centered link.

**Section III — Editorial:**
- Section marker: `[SECTION_3_MARKER]`
- H2: `[SECTION_3_HEADING]`
- Top-right: `All notes →` link.
- 2–3 article preview rows (no images):
  - `[ARTICLE_DATE]` — uppercase, small, muted.
  - Bold serif title: `[ARTICLE_TITLE]`
  - One-sentence body text: `[ARTICLE_SUMMARY]`
- Separated by hairline borders.

**Section IV — CTA:**
- Centered block, generous padding.
- Small italic serif preheading: `[CTA_PREHEADING]`
- H2 serif: `[CTA_HEADING]`
- Body subtext: `[CTA_SUBTEXT]`
- One ghost/outline button: `[CTA_BUTTON_LABEL]` — dark border, no fill, no heavy border-radius, tracked sans text inside.

---

### 2. Browse / Catalog Page (`/browse`)

- **Two-column layout on desktop:**
  - Left sidebar (~240px): filter groups `[FILTER_GROUP_1]`, `[FILTER_GROUP_2]`, `[FILTER_GROUP_3]`. Each group is collapsible. Active filter shown with underline indicator, not filled background.
  - Right: full list of item rows in the same format as homepage Section II.
- Sort controls top-right: `Sort by: newest / [FILTER_GROUP_1] / [FILTER_GROUP_2]` — plain uppercase tab links, no box styling.
- Pagination at bottom-center: plain `← Previous` / `Next →` text, no numbered buttons.

---

### 3. Tips / Editorial Index Page (`/tips` or `/notes`)

- Eyebrow: `Editorial · Notes`
- H1: `[SECTION_3_HEADING]`
- Subtitle: one-paragraph body text intro.
- Chronological list of articles:
  - Each row: date (left, muted, uppercase), title (bold serif), summary (body text), `Read →` link.
  - Hairline border between rows.

---

### 4. Article / Tip Detail Page (`/tips/[slug]`)

- Breadcrumb: `[APP_NAME] / [BREADCRUMB_SECTION] / [ARTICLE_TITLE]` — small muted slash-separated text.
- Eyebrow: `[ARTICLE_DATE] · [APP_NAME] Editors` — uppercase tracked.
- H1: `[ARTICLE_TITLE]` — large serif, max-width ~640px, left-aligned.
- Intro lede: first paragraph in slightly larger body text (~19px), slightly heavier weight.
- Full article body:
  ```
  [ARTICLE_BODY_MD]
  ```
  Rendered with: `##` section headers as serif bold ~22px; `**bold**` as typographic weight only (no box highlight); `` `inline code` `` as monospace with subtle `#F0F0EA` background; no decorative elements.
- End of article: `## Related [SECTION_3_HEADING]` — 2 horizontal article preview rows (same format as tips list).
- No comments, no share buttons, no social widgets, no author avatar.

---

### 5. Command Palette (⌘K overlay)

- Triggered by clicking search bar or pressing `⌘K` / `Ctrl+K`.
- Overlay: `rgba(0,0,0,0.4)` backdrop behind.
- Modal: centered, ~580px wide, white `#FFFFFF` background, `border-radius: 8px`, subtle shadow.
- Top: autofocused input, large, borderless inside modal.
- Results grouped below with uppercase section labels: Items, Organizations, Tags.
- Each result row: badge/icon + title + meta. Keyboard navigable (`↑↓` arrows, `Enter` to go).

---

## Footer

- Full-width `1px solid #E5E5DF` divider above.
- 4-column layout:
  - Col 1: Logo + tagline + `[FOOTER_DISCLAIMER]` — small muted text.
  - Col 2: `[FOOTER_GROUP_1_LABEL]` + 3–4 links below.
  - Col 3: `[FOOTER_GROUP_2_LABEL]` + 3–4 links below.
  - Col 4: `[FOOTER_GROUP_3_LABEL]` + 3–4 links below.
- Bottom bar (full width): `© [COPYRIGHT_YEAR] [APP_NAME]` left, `An independent community catalog.` right — small, muted.

---

## Mobile Behavior

- Hero heading: scale to ~36px, still centered.
- Three browse columns: stack vertically, section labels preserved.
- Item rows: full-width, org badge + title stack vertically.
- Navbar: logo top-left, search bar shrinks, `[NAV_LINK_1]` / `[NAV_LINK_2]` / `[NAV_LINK_3]` collapse into bottom tab bar or minimal hamburger drawer.
- Font sizes: drop ~15–20%; line-heights unchanged.
- No horizontal scroll anywhere.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Serif for all headings | Sans-serif display fonts |
| Burnt orange `#C96A1A` used sparingly | Rainbow or gradient accents |
| Section markers `§ I — LABEL` | Numbered stepper UI |
| Off-white `#FBFBF9` background | Pure white or dark mode default |
| List rows with hairline separators | Cards with shadows and border-radius |
| Uppercase tracked sans for metadata | Sentence-case labels for tags/dates |
| 10–16rem section padding | Dense, cramped layout |
| Italic serif for one accent word | Underline or highlight text emphasis |
| 2-letter org/category badge | Logos, avatars, or favicons |
| Ghost/outline button for CTA | Filled colored primary button |
| Generous line-height (1.75) for body | Tight body text line-height |

---

*End of prompt. Replace all `[PLACEHOLDERS]` before using.*
