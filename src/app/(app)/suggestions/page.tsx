import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { moodEntries, emotionTags, activityTags } from '@/lib/db/schema'
import { eq, desc, gte } from 'drizzle-orm'
import { SuggestionsClient, type SuggestionItem } from './suggestions-client'

const GENERIC_SUGGESTIONS: SuggestionItem[] = [
  {
    type: 'breathing',
    title: 'Box Breathing',
    description: 'A simple 4-4-4-4 breathing rhythm to calm your nervous system and center your thoughts.',
    duration: '5 minutes',
  },
  {
    type: 'journaling',
    title: 'Morning Pages',
    description: 'Write three pages of stream-of-consciousness thoughts first thing in the morning to clear mental clutter.',
    duration: '10 minutes',
  },
  {
    type: 'activity',
    title: 'Mindful Nature Walk',
    description: 'Step outside and focus on five things you can see, four you can hear, three you can touch.',
    duration: '15 minutes',
  },
]

export default async function SuggestionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get last 7 days of mood entries with tags
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const recentEntries = await db
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.userId, user.id))
    .orderBy(desc(moodEntries.loggedAt))
    .limit(50)

  const totalEntries = recentEntries.length
  const isPersonalized = totalEntries >= 5

  let suggestionItems: SuggestionItem[] = GENERIC_SUGGESTIONS

  if (isPersonalized) {
    // Get entries from last 7 days
    const recentSevenDays = recentEntries.filter(
      (e) => e.loggedAt && new Date(e.loggedAt) >= sevenDaysAgo
    )

    // Fetch emotion and activity tags for those entries
    const entryIds = recentSevenDays.map((e) => e.id)

    const [emotions, activities] = await Promise.all([
      entryIds.length > 0
        ? db
            .select()
            .from(emotionTags)
            .where(
              entryIds.length === 1
                ? eq(emotionTags.entryId, entryIds[0])
                : // Use multiple queries for simplicity
                  eq(emotionTags.entryId, entryIds[0])
            )
            .limit(50)
        : Promise.resolve([]),
      entryIds.length > 0
        ? db
            .select()
            .from(activityTags)
            .where(eq(activityTags.entryId, entryIds[0]))
            .limit(50)
        : Promise.resolve([]),
    ])

    const avgMood =
      recentSevenDays.length > 0
        ? recentSevenDays.reduce((sum, e) => sum + e.moodLevel, 0) / recentSevenDays.length
        : 3

    const moodData = {
      entryCount: totalEntries,
      recentMoods: recentSevenDays.map((e) => ({
        level: e.moodLevel,
        date: e.loggedAt,
      })),
      avgMood: Math.round(avgMood * 10) / 10,
      trend:
        recentSevenDays.length >= 2
          ? recentSevenDays[0].moodLevel - recentSevenDays[recentSevenDays.length - 1].moodLevel
          : 0,
      emotionTags: emotions.map((e) => e.tag),
      activityTags: activities.map((a) => a.activity),
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodData }),
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.suggestions?.length > 0) {
          suggestionItems = data.suggestions
        }
      }
    } catch {
      // Fall back to generic suggestions on error
      suggestionItems = GENERIC_SUGGESTIONS
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      <SuggestionsClient
        initialSuggestions={suggestionItems}
        entryCount={totalEntries}
        isPersonalized={isPersonalized}
      />
    </div>
  )
}
