# Moodify — CLAUDE.md

## What We're Building

**Moodify** is a mental health and mood tracking web app (PWA) for users aged 16–35. It sits between two competitors:
- **Daylio** — great UX, no clinical tools
- **Moodfit** — clinical depth, terrible discoverability

Moodify combines both, plus AI-powered suggestions neither competitor offers.

**One-liner:** Make mental health self-care feel as routine as checking the weather.

---

## Skills — Always Read Before Working

> These are mandatory. Read the relevant skill before starting any work in that area.

| Skill | When to read it |
|---|---|
| `shadcn` | Before adding, fixing, styling, or composing any shadcn component |
| `ui-ux-pro-max` | Before making any design decision — colors, layout, spacing, typography |
| `frontend-design` | Before building any new screen, page, or component — for aesthetic direction, motion, and visual quality |

All three skills work together:
- `ui-ux-pro-max` → UX decisions and information hierarchy
- `frontend-design` → visual aesthetic, typography, motion, atmosphere
- `shadcn` → correct component implementation

---

## Tech Stack

```
Next.js 14 (App Router)        → framework
next-pwa                        → PWA (service worker, manifest, installable)
Tailwind CSS                    → styling
shadcn/ui                       → component library (src/components/ui/)
Framer Motion                   → animations (breathing exercises, transitions)
Zustand                         → client state
Supabase                        → auth (email + Google OAuth) + PostgreSQL
Drizzle ORM                     → type-safe DB queries and migrations
Vercel AI SDK (ai)              → generateObject for structured AI responses
Vercel AI Gateway               → unified model access, no markup on tokens
claude-haiku-4-5                → default model (anthropic/claude-haiku-4-5)
Recharts                        → mood charts and analytics
jsPDF + jspdf-autotable         → client-side PDF report generation
Vercel                          → deployment
TypeScript (strict)             → language
```

---

## PWA Mobile-First Design Rules

Moodify is a PWA used primarily on phones. Every screen must be designed and built mobile-first. These rules are non-negotiable.

### Breakpoints
```
Default (no prefix)  → 375px   mobile portrait  ← design starts here
sm:                  → 640px   large phone / landscape
md:                  → 768px   tablet
lg:                  → 1024px  desktop (nice to have, not primary)
```
Never design for desktop first and shrink down. Always build 375px up.

### Touch Targets
- Every tappable element must be **minimum 44×44px** — this includes buttons, tags, icons, nav items
- Use `min-h-[44px] min-w-[44px]` on anything interactive
- Add `p-3` or more padding around small icons so the tap area is generous
- Never place two tappable elements closer than 8px apart

### Safe Areas (installed PWA)
When installed to home screen, the OS UI overlaps the app. Always account for this:
```css
/* in globals.css */
:root {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
  --sar: env(safe-area-inset-right);
}
```
```tsx
// Bottom nav must clear the home indicator on iOS
<nav className="pb-[env(safe-area-inset-bottom)] ...">
```
Always use `pb-[env(safe-area-inset-bottom)]` on the bottom navigation bar.
Always use `pt-[env(safe-area-inset-top)]` on the top header/status bar area.

### Layout Patterns for PWA
- **Bottom navigation** — primary nav lives at the bottom, thumb-reachable. Never top nav on mobile.
- **Full-screen pages** — each page fills the viewport. Use `min-h-[100dvh]` not `min-h-screen` (dvh accounts for mobile browser chrome).
- **Scrollable content** — content scrolls between a fixed header and fixed bottom nav. Pattern:
  ```tsx
  <div className="flex flex-col min-h-[100dvh]">
    <header className="fixed top-0 ... pt-[env(safe-area-inset-top)]" />
    <main className="flex-1 overflow-y-auto mt-[header-height] mb-[nav-height] px-4" />
    <nav className="fixed bottom-0 ... pb-[env(safe-area-inset-bottom)]" />
  </div>
  ```
- **Sheets over modals** — use shadcn `Sheet` (slides up from bottom) instead of centered `Dialog` for mobile actions. Bottom sheets feel native on mobile.
- **Full-width buttons** — primary action buttons are `w-full` on mobile.
- **Cards fill width** — no fixed-width cards on mobile. Use `w-full` with `px-4` page padding.

### Typography for Mobile
- Minimum body font size: `text-base` (16px) — never smaller on mobile, prevents iOS zoom on inputs
- Input fields must be `text-base` or larger to prevent iOS auto-zoom on focus
- Line height: `leading-relaxed` for body text — tight line heights are hard to read on small screens
- Headings: scale down on mobile. Use `text-2xl md:text-4xl` patterns

### Inputs & Forms
- All `<input>` and `<textarea>` must have `text-base` or `text-[16px]` to prevent iOS zoom
- Use `inputMode` attribute for correct mobile keyboards:
  ```tsx
  <Input inputMode="numeric" />   // number pad
  <Input inputMode="email" />     // email keyboard
  <Input type="text" />           // default
  ```
- Form fields should be spaced `gap-4` minimum — fat fingers need room

### Performance (PWA = must be fast)
- Images: always use `next/image` with explicit `width` and `height`
- Never block the main thread on page load — defer non-critical JS
- Skeleton screens on every data fetch — never show blank space
- Animate with `transform` and `opacity` only — never animate `height`, `width`, or `margin` (causes reflow)
- Use `will-change: transform` on Framer Motion elements that animate frequently (breathing circle)

### PWA-Specific UX Patterns
- **Install prompt** — show a custom "Add to Home Screen" banner on first visit for iOS users (iOS doesn't show the native prompt automatically)
- **Offline state** — show a subtle banner when offline: `"You're offline — your mood will sync when you reconnect"`
- **Splash screen** — configure in manifest.json with Moodify's brand color so the launch screen looks native
- **No hover-only interactions** — never put critical functionality only on hover. Hover states are progressive enhancement only.
- **Pull to refresh** — do not implement unless explicitly required. PWA scroll feels different from native.
- **Viewport meta** — must be in layout.tsx:
  ```tsx
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  ```
  `viewport-fit=cover` is required for safe area insets to work on iOS.

---

## Project Structure

```
moodify/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx              # Fixed bottom nav + safe area handling
│   │   │   ├── page.tsx                # Home: log today's mood
│   │   │   ├── history/page.tsx        # Calendar + Year in Pixels
│   │   │   ├── insights/page.tsx       # Charts and analytics
│   │   │   ├── tools/
│   │   │   │   ├── breathing/page.tsx
│   │   │   │   ├── cbt/page.tsx
│   │   │   │   └── gratitude/page.tsx
│   │   │   ├── assessments/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   └── suggestions/route.ts
│   │   └── layout.tsx                  # viewport meta with viewport-fit=cover
│   ├── components/
│   │   ├── mood/
│   │   │   ├── MoodPicker.tsx          # 5 emoji mood selector, min 44px targets
│   │   │   ├── EmotionTags.tsx         # shadcn Toggle + ToggleGroup
│   │   │   ├── ActivityTags.tsx        # shadcn Toggle + ToggleGroup
│   │   │   └── MoodLogForm.tsx
│   │   ├── insights/
│   │   │   ├── MoodTrendChart.tsx      # Recharts, mobile-sized
│   │   │   ├── ActivityCorrelation.tsx
│   │   │   └── YearInPixels.tsx        # responsive dot grid
│   │   ├── tools/
│   │   │   ├── BreathingGuide.tsx      # Framer Motion, full-screen on mobile
│   │   │   ├── CBTThoughtRecord.tsx
│   │   │   └── GratitudeJournal.tsx
│   │   ├── assessments/
│   │   │   ├── PHQ9Form.tsx
│   │   │   └── GAD7Form.tsx
│   │   ├── pwa/
│   │   │   ├── InstallPrompt.tsx       # Custom iOS install banner
│   │   │   └── OfflineBanner.tsx       # Offline state indicator
│   │   └── ui/                         # shadcn components — do not edit directly
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   ├── index.ts
│   │   │   └── queries/
│   │   │       ├── mood.ts
│   │   │       ├── assessments.ts
│   │   │       └── gratitude.ts
│   │   ├── store/
│   │   │   └── moodStore.ts
│   │   └── utils/
│   │       ├── pdf.ts
│   │       └── export.ts
│   ├── hooks/
│   │   ├── useMoodLog.ts
│   │   ├── useInsights.ts
│   │   └── usePWAInstall.ts            # detects iOS, shows install prompt
│   └── types/
│       └── index.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── docs/
│   ├── deliverable-1.pdf
│   └── deliverable-2.pdf
├── drizzle/
│   └── migrations/
├── drizzle.config.ts
└── CLAUDE.md
```

---

## Reference Documents

- `docs/deliverable-1.pdf` — problem statement, stakeholder analysis, competitive analysis (Daylio vs Moodfit)
- `docs/deliverable-2.pdf` — full functional/non-functional requirements, use cases (UC-01 to UC-05), constraints, Figma screenshots

When implementing any feature, reference the relevant use case from deliverable-2.pdf for the exact main flow, alternative flows, and exception flows.

---

## Figma

The Moodify Figma file contains the full design. Use the Figma MCP to read designs directly:

1. Select a frame in Figma → right click → Copy link to selection
2. Paste into your prompt: `"Implement this screen: [link]. Use our Next.js + Tailwind + shadcn stack, mobile-first."`

**Always read `frontend-design` + `ui-ux-pro-max` + `shadcn` skills before implementing any screen.**

---

## Database Schema (Drizzle)

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, integer, boolean, timestamp, date, jsonb } from 'drizzle-orm/pg-core'

export const moodEntries = pgTable('mood_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  moodLevel: integer('mood_level').notNull(),   // 1-5
  note: text('note'),                           // max 500 chars, enforced in app
  loggedAt: timestamp('logged_at').defaultNow(),
})

export const emotionTags = pgTable('emotion_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull(),
  tag: text('tag').notNull(),
})

export const activityTags = pgTable('activity_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull(),
  activity: text('activity').notNull(),
})

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(),                 // 'PHQ9' | 'GAD7'
  answers: jsonb('answers').notNull(),
  score: integer('score').notNull(),
  takenAt: timestamp('taken_at').defaultNow(),
})

export const gratitudeLogs = pgTable('gratitude_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  items: text('items').array().notNull(),       // min 3 items enforced in app
  loggedAt: timestamp('logged_at').defaultNow(),
})

export const suggestions = pgTable('suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(),                 // 'breathing' | 'journaling' | 'activity'
  engaged: boolean('engaged').default(false),
  helpful: boolean('helpful'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const streaks = pgTable('streaks', {
  userId: uuid('user_id').primaryKey(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastLoggedDate: date('last_logged_date'),
})
```

### RLS — apply to every table, no exceptions
```sql
alter table mood_entries enable row level security;
create policy "own data only" on mood_entries
  for all using (auth.uid() = user_id);
-- repeat for every table
```

---

## shadcn Component Map

> Always read the `shadcn` skill before using these.

| Moodify Feature | shadcn Component |
|---|---|
| Mood log form | `Card` + `Button` + `Textarea` |
| Emotion / activity tags | `Toggle` + `ToggleGroup` |
| Assessment questions | `Progress` + `Card` |
| Suggestion cards | `Card` + `Badge` |
| Mobile action menus | `Sheet` (bottom sheet, not Dialog) |
| Export / confirm dialogs | `Dialog` |
| Loading states | `Skeleton` |
| Crisis alert banner | `Alert` |
| Settings panels | `Tabs` |
| Push notification prompt | `Toast` |
| Auth forms | `Input` + `Button` + `Card` |

---

## AI Suggestions (FR-07)

```typescript
// src/app/api/suggestions/route.ts
import { generateObject } from 'ai'
import { z } from 'zod'

const suggestionSchema = z.object({
  suggestions: z.array(z.object({
    type: z.enum(['breathing', 'journaling', 'activity']),
    title: z.string(),
    description: z.string(),
    duration: z.string(),
  })).min(1).max(3)
})

export async function POST(req: Request) {
  const { moodData } = await req.json()
  const { object } = await generateObject({
    model: 'anthropic/claude-haiku-4-5',
    schema: suggestionSchema,
    prompt: buildSuggestionPrompt(moodData),
  })
  return Response.json(object)
}
```

Requires minimum 5 mood entries. Below that show generic wellness tips without calling the API.

---

## Breathing Exercises (FR-09)

```tsx
// Full-screen on mobile — use min-h-[100dvh]
// Framer Motion animates circle per phase
// Web Audio API plays tone at each transition
// Screen Wake Lock keeps display on

const phases = [
  { label: 'Inhale', duration: 4, scale: 1.4 },
  { label: 'Hold',   duration: 7, scale: 1.4 },
  { label: 'Exhale', duration: 8, scale: 1.0 },
]
```

Available: Box Breathing (4-4-4-4), 4-7-8, simple Inhale/Exhale.
Free, no login required (FR-09 hard constraint).

---

## Hard Constraints — Never Break These

1. **Core features always free:** mood logging, breathing, analytics, data export
2. **No ads, no third-party data sharing — ever**
3. **Every PHQ-9/GAD-7 result screen** must include disclaimer: results are not a clinical diagnosis
4. **Crisis resources must auto-show** if PHQ-9 score ≥ 20 OR question 9 answered non-zero — user must acknowledge before seeing results
5. **Data deletion in settings** — full purge within 30 days (GDPR)
6. **Premium pricing** ≤ Rs. 800/month at launch
7. **RLS enabled on every Supabase table** — no exceptions

---

## Coding Rules

- TypeScript strict — no `any`
- Server Components by default — `'use client'` only for hooks or browser APIs
- Never call Supabase or Drizzle directly from a component — use a custom hook or server action
- Drizzle for all DB queries — no raw SQL unless unavoidable
- **Mobile-first always** — write base styles for 375px, then `sm:` `md:` `lg:` upward
- **Use `min-h-[100dvh]`** not `min-h-screen` for full-height layouts
- **All touch targets min 44×44px** — use `min-h-[44px] min-w-[44px]`
- **All inputs `text-base` minimum** — prevents iOS zoom on focus
- **Bottom sheets over modals** on mobile — use shadcn `Sheet`
- **Animate only `transform` and `opacity`** — never animate layout properties
- Every async operation needs a loading state — use shadcn `Skeleton`
- Error boundaries on all major page sections
- Use shadcn components as the base for all UI — never build from scratch what shadcn provides
- Never edit files inside `src/components/ui/` directly — customize via Tailwind on wrappers

---

## Mood Scale

| Level | Label | Color |
|---|---|---|
| 1 | Awful | `#EF4444` |
| 2 | Bad | `#F97316` |
| 3 | Neutral | `#EAB308` |
| 4 | Good | `#84CC16` |
| 5 | Great | `#22C55E` |

## Assessment Scoring

**PHQ-9:** 0-4 Minimal · 5-9 Mild · 10-14 Moderate · 15-19 Moderately Severe · 20-27 Severe ⚠️
**GAD-7:** 0-4 Minimal · 5-9 Mild · 10-14 Moderate · 15-21 Severe ⚠️

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only
DATABASE_URL=                   # Supabase direct connection string for Drizzle
AI_GATEWAY_API_KEY=             # server only — from Vercel dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## npm Scripts

```bash
npm run dev          # start dev server
npm run db:generate  # generate drizzle migration
npm run db:migrate   # run migrations
npm run db:push      # push schema directly (dev only)
npm run db:studio    # open drizzle studio
```

---

## Team

Ahmed Raza · Bilal Rana · Meerab Chaudry · M. Samama Usman
SE 200 — BSCS-13E · NUST SEECS · Instructor: Sir Sarosh Tahir
