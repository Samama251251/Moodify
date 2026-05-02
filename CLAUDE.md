# Moodify — CLAUDE.md

## What We're Building

**Moodify** is a mental health and mood tracking PWA (Progressive Web App) for users aged 16–35.
Tagline: **"Your Digital Sanctuary"** — Track your mood. Understand yourself.

It sits between two competitors:
- **Daylio** — great UX, gamification, no clinical tools
- **Moodfit** — clinical depth, terrible UX and discoverability

Moodify combines both, plus AI-powered suggestions neither competitor offers.

---

## Skills — Always Read Before Working

> Mandatory. Read the relevant skill before starting any work in that area.
> All skill files live in `.agents/skills/`.

| Skill | Path | When to read it |
|---|---|---|
| `shadcn` | [`.agents/skills/shadcn/SKILL.md`](.agents/skills/shadcn/SKILL.md) | Before adding, fixing, styling, or composing any shadcn component |
| `ui-ux-pro-max` | [`.agents/skills/ui-ux-pro-max/SKILL.md`](.agents/skills/ui-ux-pro-max/SKILL.md) | Before any design decision — colors, layout, spacing, typography |
| `frontend-design` | [`.agents/skills/frontend-design/SKILL.md`](.agents/skills/frontend-design/SKILL.md) | Before building any new screen or component — aesthetic direction, motion, visual quality |

All three work together: `ui-ux-pro-max` → UX hierarchy, `frontend-design` → visual aesthetic, `shadcn` → component implementation.

---

## Tech Stack

```
Next.js 14 (App Router)        → framework
next-pwa                        → PWA (service worker, manifest, installable)
Tailwind CSS                    → styling
shadcn/ui (Nova preset)         → component library (src/components/ui/)
Framer Motion                   → animations (breathing, transitions, confirmation)
Zustand                         → client state + draft mood entry persistence
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

## Figma Design Reference

**Prototype link:** https://www.figma.com/proto/6vdpLrYCWUPflvdUOinY3x/Untitled?node-id=9-56&p=f&t=v337jNvcRAasiwI4-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1

**11 designed screens:** Login, Sign Up, Dashboard, Log Mood, Insights, Year in Pixels, Suggestions, PHQ-9 Assessment, Clinical Check-in, Export Data, Results, Settings

**Design language:** Warm earthy tones, soft yellows and creams, calming visual language. The design uses a sidebar nav on desktop and bottom nav on mobile.

**Always read `frontend-design` + `ui-ux-pro-max` + `shadcn` skills before implementing any screen.**

To use Figma MCP with Claude Code:
1. Select a frame in Figma → right click → Copy link to selection
2. Paste into prompt: `"Implement this screen: [link]. Use Next.js + Tailwind + shadcn, mobile-first."`

---

## All Features (FR = Functional Requirement)

| ID | Feature | Status | Notes |
|---|---|---|---|
| FR-01 | Auth — email/password + Google OAuth | MVP | Supabase Auth |
| FR-02 | Mood Logging — 1–5 emoji scale, ≤30 seconds, ≤3 taps | MVP | Multiple entries/day allowed |
| FR-03 | Emotion & Activity Tagging | MVP | Both optional |
| FR-04 | Optional Journal Note — max 500 chars | MVP | |
| FR-05 | Mood History & Calendar View (Year in Pixels) | MVP | 365 colored squares |
| FR-06 | Analytics Dashboard — weekly/monthly/yearly | MVP | Min 3 entries to show |
| FR-07 | AI-Powered Personalized Suggestions | MVP | Min 5 entries to personalize |
| FR-08 | CBT Tools & Thought Records | MVP | Guided structured prompts |
| FR-09 | Breathing Exercises — free, no login wall | MVP | Box, 4-7-8, simple |
| FR-10 | Gratitude Journal — min 3 items prompt | MVP | Separate from mood logs |
| FR-11 | Clinical Assessments — PHQ-9 & GAD-7 | MVP | 24hr cooldown between retakes |
| FR-12 | Gamification — Streaks & Achievement Badges | MVP | 7-day, 30-log milestones |
| FR-13 | Therapist Report Generation — PDF | MVP | Client-side jsPDF |
| FR-14 | Data Export — CSV + PDF, free | MVP | Web Share API for sharing |
| FR-15 | Push Notification Reminders — configurable | MVP | Web Push API |
| — | Mindfulness / Meditation | MVP | Simple guided sessions |
| — | Medication Tracking | v2 deferred | |
| — | Nervous System Regulation Tool | v2 deferred | |

---

## Database Schema (Drizzle)

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, integer, boolean, timestamp, date, jsonb } from 'drizzle-orm/pg-core'

// Auth is handled by Supabase (auth.users) — all tables reference auth.uid()

export const moodEntries = pgTable('mood_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  moodLevel: integer('mood_level').notNull(),   // 1-5
  note: text('note'),                           // max 500 chars, enforced in app
  isDraft: boolean('is_draft').default(false),  // auto-saved draft support (UC-01 E2)
  loggedAt: timestamp('logged_at').defaultNow(),
})

export const emotionTags = pgTable('emotion_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull(),          // references mood_entries
  tag: text('tag').notNull(),
  // Values: 'anxious' | 'happy' | 'tired' | 'calm' | 'sad' | 'energetic' | 'overwhelmed' | etc.
})

export const activityTags = pgTable('activity_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull(),
  activity: text('activity').notNull(),
  // Values: 'exercise' | 'sleep' | 'social' | 'work' | 'nature' | 'meditation' | etc.
})

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(),                 // 'PHQ9' | 'GAD7'
  answers: jsonb('answers').notNull(),          // array of 0-3 integer scores
  score: integer('score').notNull(),
  severityLabel: text('severity_label').notNull(), // 'Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe'
  takenAt: timestamp('taken_at').defaultNow(),
})

export const gratitudeLogs = pgTable('gratitude_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  items: text('items').array().notNull(),       // min 3 items, enforced in app
  loggedAt: timestamp('logged_at').defaultNow(),
})

export const suggestions = pgTable('suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(),                 // 'breathing' | 'journaling' | 'activity'
  engaged: boolean('engaged').default(false),
  helpful: boolean('helpful'),                  // null = no feedback yet
  createdAt: timestamp('created_at').defaultNow(),
})

export const streaks = pgTable('streaks', {
  userId: uuid('user_id').primaryKey(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastLoggedDate: date('last_logged_date'),
})

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  badge: text('badge').notNull(),
  // Values: '7_day_streak' | '30_day_streak' | '30_logs' | '100_logs' | 'first_assessment' | etc.
  awardedAt: timestamp('awarded_at').defaultNow(),
})

export const notifications = pgTable('notifications', {
  userId: uuid('user_id').primaryKey(),
  isEnabled: boolean('is_enabled').default(false),
  scheduledTime: text('scheduled_time'),        // e.g. "20:00" — user's preferred reminder time
  pushSubscription: jsonb('push_subscription'), // Web Push subscription object
})
```

### RLS — apply to every table, no exceptions
```sql
alter table mood_entries enable row level security;
create policy "own data only" on mood_entries
  for all using (auth.uid() = user_id);
-- Repeat this pattern for every table
```

---

## Navigation Structure

### Desktop (sidebar)
```
Moodify
├── Dashboard       ← home, mood log widget + insights preview
├── Log Mood        ← dedicated mood logging flow
├── Insights        ← charts, Year in Pixels, activity correlations
├── Suggestions     ← AI wellness suggestion cards
├── Assessments     ← PHQ-9, GAD-7
├── Export          ← PDF/CSV export + Share with Therapist
└── Settings        ← notifications, account, data deletion
```

### Mobile (bottom nav — 5 tabs max)
```
Home | Insights | + (Log Mood) | Tools | Settings
```
The "+" button is center-prominent, floating — the primary action on mobile.

---

## PWA Mobile-First Design Rules

This is a PWA used primarily on phones. Every screen must be built mobile-first.

### Breakpoints
```
Default (no prefix)  → 375px   mobile portrait  ← always start here
sm:                  → 640px   large phone / landscape
md:                  → 768px   tablet
lg:                  → 1024px  desktop (sidebar nav appears here)
```

### Touch & Layout
- Every tappable element: minimum **44×44px** (`min-h-[44px] min-w-[44px]`)
- Full-height: use `min-h-[100dvh]` not `min-h-screen`
- Primary buttons: `w-full` on mobile
- Action menus: shadcn `Sheet` (bottom sheet) not `Dialog` on mobile

### Safe Areas (installed PWA)
```tsx
// Required in root layout
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

// Bottom nav
<nav className="pb-[env(safe-area-inset-bottom)] ...">

// Top header
<header className="pt-[env(safe-area-inset-top)] ...">
```

### Inputs
- All `<input>` / `<textarea>`: minimum `text-base` (16px) — prevents iOS zoom on focus
- Use `inputMode` for correct mobile keyboards (`numeric`, `email`, etc.)

### Performance
- `next/image` for all images with explicit dimensions
- Skeleton screens on every data fetch — never blank space
- Animate only `transform` and `opacity` — never layout properties

---

## Year in Pixels — Color Scheme

From the Figma design, Year in Pixels uses **4 emotion categories** (not the 5-level mood scale):

| Color | Emotion Category | Tailwind |
|---|---|---|
| Green | Joyful / Calm | `#4CAF82` |
| Gold | Energetic / Productive | `#F5A623` |
| Gray | Neutral / Tired | `#9E9E9E` |
| Pink | Anxious / Overwhelmed | `#E991A0` |
| Empty | No entry that day | `#E5E7EB` |

Map mood entries to these categories based on primary emotion tag. If no emotion tag, fall back to mood level (4-5 = green, 3 = gold, 2 = gray, 1 = pink).

---

## Mood Scale (5-level)

| Level | Label | Emoji | Color |
|---|---|---|---|
| 1 | Awful | 😞 | `#EF4444` |
| 2 | Bad | 😕 | `#F97316` |
| 3 | Neutral | 😐 | `#EAB308` |
| 4 | Good | 🙂 | `#84CC16` |
| 5 | Great | 😄 | `#22C55E` |

---

## Key Feature Logic

### Mood Logging (UC-01)
- Minimum valid entry: mood level only (emotion/activity tags are optional)
- Multiple entries allowed per day — analytics averages them for daily score
- Auto-save draft to Zustand store on every change — restore on re-open (exception E2)
- On save: validate mood level → save to DB → update streak → check achievements → trigger suggestions if ≥5 entries → show confirmation animation

### Analytics (UC-02)
- Minimum 3 entries to show charts — otherwise show "Keep logging" prompt
- Dashboard default: weekly view with trend line, avg mood, mood distribution, streak
- Activity correlation: bar chart ranking activities by avg associated mood score
- AI pattern detection: surface observations like "Your mood drops on Mondays"
- Year in Pixels: 365 colored squares, tap a day to see entry detail in a side panel

### AI Suggestions (UC-03)
- Trigger: automatically after saving a mood entry, OR manual visit to Suggestions tab
- Minimum 5 entries to personalize — below that show generic wellness tips
- Context sent to AI: last 7 days of mood levels, trend direction, emotion tags, activity tags, time of day
- Output: 1-3 suggestion cards (type: breathing | journaling | activity)
- After user engages: ask "Did this help?" thumbs up/down → log feedback → improve future suggestions
- If user dismisses 5+ suggestions in a row: show short preference survey

### Assessments (UC-04)
- 24-hour cooldown between retakes of the same assessment type
- Disclaimer screen before every assessment: "This is a standard screening tool, not a diagnosis"
- One question at a time with progress bar
- Crisis resources auto-show if PHQ-9 score ≥ 20 OR question 9 (Q9) answered non-zero
- User must acknowledge crisis resources before seeing results
- Results saved to assessment history with trend comparison to last score

### Export & Share (UC-05)
- PDF generated client-side with jsPDF — no server needed
- Use Web Share API (`navigator.share()`) to open native share sheet
- PDF must include disclaimer: "This is not a medical record"
- CSV columns: date, time, mood level, emotions, activities, notes, assessment scores
- Data deletion option available (permanent, irreversible, GDPR-compliant)

### Streaks & Achievements (FR-12)
- Streak increments if user logs at least 1 mood entry per calendar day
- Milestone badges: 7-day streak, 30-day streak, 30 total logs, 100 total logs, first assessment
- Show achievement unlock animation on badge award

### Push Notifications (FR-15)
- Use Web Push API via next-pwa service worker
- User sets preferred reminder time in Settings
- iOS: only works when app is installed to home screen (iOS 16.4+)
- Show install prompt banner to iOS users who haven't installed the app

---

## AI Suggestions API

```typescript
// src/app/api/suggestions/route.ts
import { generateObject } from 'ai'
import { z } from 'zod'

const suggestionSchema = z.object({
  suggestions: z.array(z.object({
    type: z.enum(['breathing', 'journaling', 'activity']),
    title: z.string(),
    description: z.string(),
    duration: z.string(),           // e.g. "5 minutes"
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

---

## Breathing Exercises (FR-09)

```tsx
// Full-screen on mobile (min-h-[100dvh])
// Framer Motion animates circle per phase
// Web Audio API plays soft tone at phase transitions
// Screen Wake Lock keeps display on during session

const exercises = {
  box:      [{ label: 'Inhale', duration: 4 }, { label: 'Hold', duration: 4 }, { label: 'Exhale', duration: 4 }, { label: 'Hold', duration: 4 }],
  '4-7-8':  [{ label: 'Inhale', duration: 4 }, { label: 'Hold', duration: 7 }, { label: 'Exhale', duration: 8 }],
  simple:   [{ label: 'Inhale', duration: 4 }, { label: 'Exhale', duration: 4 }],
}
```

Free, accessible from home screen, no login required (FR-09 hard constraint).

---

## shadcn Component Map

> Always read the `shadcn` skill before using these.

| Feature | shadcn Component |
|---|---|
| Mood log form | `Card` + `Button` + `Textarea` |
| Emotion / activity tags | `Toggle` + `ToggleGroup` |
| Assessment questions | `Progress` + `Card` |
| Suggestion cards | `Card` + `Badge` |
| Mobile action menus | `Sheet` (bottom sheet, not Dialog) |
| Export / confirm dialogs | `Dialog` |
| Loading states | `Skeleton` |
| Crisis alert + achievement | `Alert` |
| Settings panels | `Tabs` |
| Push notification / install prompt | `Toast` |
| Auth forms | `Input` + `Button` + `Card` |
| Streak display | `Badge` |
| Assessment progress | `Progress` |

---

## Hard Constraints — Never Break These

1. **Core features always free:** mood logging, breathing, analytics, data export, assessments
2. **No ads, no third-party data sharing — ever**
3. **Every PHQ-9/GAD-7 result screen** must show disclaimer: results are not a clinical diagnosis
4. **Crisis resources must auto-show** if PHQ-9 score ≥ 20 OR question 9 answered non-zero — user must acknowledge before seeing results
5. **Data deletion available in settings** — full purge within 30 days (GDPR)
6. **Premium pricing** ≤ Rs. 800/month at launch
7. **RLS must be enabled on every Supabase table** — no exceptions
8. **Breathing exercises accessible without login** from home screen

---

## Coding Rules

- TypeScript strict — no `any`
- Server Components by default — `'use client'` only for hooks or browser APIs
- Never call Supabase or Drizzle directly from a component — use a custom hook or server action
- Drizzle for all DB queries — no raw SQL unless unavoidable
- **Mobile-first always** — write base styles for 375px, then `sm:` `md:` `lg:` upward
- **Use `min-h-[100dvh]`** not `min-h-screen` for full-height layouts
- **All touch targets min 44×44px**
- **All inputs `text-base` minimum** — prevents iOS zoom on focus
- **Bottom sheets over modals** on mobile — use shadcn `Sheet`
- **Animate only `transform` and `opacity`** — never animate layout properties
- Every async operation: loading state with shadcn `Skeleton`
- Error boundaries on all major page sections
- Use shadcn components as the base — never build from scratch what shadcn provides
- Never edit files inside `src/components/ui/` — customize via Tailwind on wrappers

---

## Mixpanel Analytics — Always Add Tracking

> **Mandatory.** Every new user-facing feature, screen, or interaction **must** include Mixpanel event tracking before it is considered complete.

### Setup
- SDK: `mixpanel-browser` — initialized once via `MixpanelProvider` in root layout
- Token: `NEXT_PUBLIC_MIXPANEL_TOKEN` in `.env`
- Core lib: `src/lib/mixpanel.ts` — exposes `mp.track()`, `mp.identify()`, `mp.people.set()`, `mp.register()`, `mp.reset()`
- Provider: `src/components/providers/mixpanel-provider.tsx` — handles init + auto-identity via Supabase auth state

### How to track
```typescript
import { mp } from '@/lib/mixpanel'

// In any client component, after the user action succeeds:
mp.track('event_name', { key: 'value' })
```

### What to track (add events for every new feature)
| Category | Events to add |
|---|---|
| Auth | `login_completed`, `login_failed`, `sign_up_completed`, `sign_up_failed`, `session_started` (auto) |
| Mood logging | `mood_logged` (level, label, has_note, emotion_tags, activity_tags) |
| Assessments | `assessment_started`, `assessment_completed` (type, score, severity) |
| AI Suggestions | `suggestion_viewed`, `suggestion_engaged`, `suggestion_feedback` (type, helpful) |
| Breathing | `breathing_started`, `breathing_completed` (exercise_type, duration) |
| Gratitude | `gratitude_logged` (item_count) |
| Export | `report_exported` (format: pdf/csv) |
| Navigation | Page views tracked automatically by SDK |

### Rules
- **Track after success, not on click** — only fire events after the action completes in the DB/API
- **Use snake_case** for all event names and property keys
- **Never send PII in event properties** — no journal notes, no email in custom props (profile props like `$email` are fine via `mp.people.set`)
- **Import `mp` from `@/lib/mixpanel`** — never import `mixpanel-browser` directly in components
- Identity is managed automatically by `MixpanelProvider` — do not call `mp.identify()` or `mp.reset()` in feature code
## Visual Verification — `/browse`

**Mandatory.** After building or modifying any UI screen or component, use the `/browse` skill to visually verify the result in the browser before reporting the task as complete.

### When to use `/browse`
- After implementing a new page or screen
- After changing layout, spacing, colors, or typography
- After adding or modifying animations/transitions
- After fixing any visual bug
- After responsive design changes — check both mobile (375px) and desktop (1024px+) viewports
- When the Figma design is the reference — browse to compare against the design

### How to use it
1. Ensure the dev server is running (`npm run dev` on port 3000)
2. Invoke `/browse` to navigate to the relevant page on `localhost:3000`
3. Take screenshots and visually inspect the rendered output
4. If the output doesn't match expectations or the Figma design, iterate on the code and re-check
5. Test the golden path **and** edge cases (empty states, loading states, error states)

### What to verify
- Layout matches Figma / design intent (spacing, alignment, hierarchy)
- Mobile-first rendering looks correct at 375px
- Touch targets are visually adequate (44×44px minimum)
- Colors, typography, and visual hierarchy match the design system
- Animations and transitions render smoothly
- No visual regressions on surrounding components

**Do not claim a UI task is complete without visually verifying it with `/browse`.**

---

## Assessment Scoring Reference

**PHQ-9 (Depression — 9 questions, 0–3 each, max 27):**
| Score | Severity |
|---|---|
| 0–4 | Minimal |
| 5–9 | Mild |
| 10–14 | Moderate |
| 15–19 | Moderately Severe |
| 20–27 | Severe ⚠️ → show crisis resources |

**GAD-7 (Anxiety — 7 questions, 0–3 each, max 21):**
| Score | Severity |
|---|---|
| 0–4 | Minimal |
| 5–9 | Mild |
| 10–14 | Moderate |
| 15–21 | Severe ⚠️ → show crisis resources |

---

## Reference Documents

- `docs/deliverable-1.pdf` — problem statement, objectives, stakeholders, competitive analysis (Daylio vs Moodfit)
- `docs/deliverable-2.pdf` — functional requirements (FR-01–FR-15), non-functional requirements, assumptions, constraints, use cases UC-01–UC-05, Figma login + dashboard screens
- `docs/deliverable-3.pdf` — final use case diagram, class diagram (12 classes), sequence diagrams (UC-01, UC-02), activity diagram (full app flow), updated Figma prototype (11 screens)

When implementing any feature, reference the relevant use case from deliverable-2.pdf for exact main flow, alternative flows, and exception flows.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only
DATABASE_URL=                   # Supabase direct connection string for Drizzle
AI_GATEWAY_API_KEY=             # server only — from Vercel dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=   # for Web Push notifications
VAPID_PRIVATE_KEY=              # server only
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
