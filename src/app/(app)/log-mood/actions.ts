'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { moodEntries, emotionTags, activityTags, streaks, achievements } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface SaveMoodResult {
  success: boolean
  entryId?: string
  newAchievements?: string[]
  error?: string
}

export async function saveMoodEntry(data: {
  moodLevel: number
  emotions: string[]
  activities: string[]
  note: string
}): Promise<SaveMoodResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const userId = user.id

    // Insert mood entry
    const [entry] = await db
      .insert(moodEntries)
      .values({
        userId,
        moodLevel: data.moodLevel,
        note: data.note || null,
        isDraft: false,
      })
      .returning({ id: moodEntries.id })

    // Insert emotion tags
    if (data.emotions.length > 0) {
      await db
        .insert(emotionTags)
        .values(data.emotions.map((tag) => ({ entryId: entry.id, tag })))
    }

    // Insert activity tags
    if (data.activities.length > 0) {
      await db
        .insert(activityTags)
        .values(data.activities.map((activity) => ({ entryId: entry.id, activity })))
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

    const existing = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(streaks).values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastLoggedDate: today,
      })
    } else {
      const s = existing[0]
      if (s.lastLoggedDate !== today) {
        const newCurrent =
          s.lastLoggedDate === yesterday ? (s.currentStreak ?? 0) + 1 : 1
        const newLongest = Math.max(s.longestStreak ?? 0, newCurrent)
        await db
          .update(streaks)
          .set({ currentStreak: newCurrent, longestStreak: newLongest, lastLoggedDate: today })
          .where(eq(streaks.userId, userId))
      }
    }

    // Award achievements
    const [[{ total }], streakRow, existingBadges] = await Promise.all([
      db
        .select({ total: count() })
        .from(moodEntries)
        .where(eq(moodEntries.userId, userId)),
      db.select().from(streaks).where(eq(streaks.userId, userId)).limit(1),
      db
        .select({ badge: achievements.badge })
        .from(achievements)
        .where(eq(achievements.userId, userId)),
    ])

    const badgeSet = new Set(existingBadges.map((a) => a.badge))
    const currentStreak = streakRow[0]?.currentStreak ?? 0
    const newAchievements: string[] = []

    const award = (badge: string, cond: boolean) => {
      if (cond && !badgeSet.has(badge)) newAchievements.push(badge)
    }

    award('first_log', total >= 1)
    award('30_logs', total >= 30)
    award('100_logs', total >= 100)
    award('7_day_streak', currentStreak >= 7)
    award('30_day_streak', currentStreak >= 30)

    if (newAchievements.length > 0) {
      await db
        .insert(achievements)
        .values(newAchievements.map((badge) => ({ userId, badge })))
    }

    revalidatePath('/')
    return { success: true, entryId: entry.id, newAchievements }
  } catch (err) {
    console.error('saveMoodEntry error:', err)
    return { success: false, error: 'Failed to save entry. Please try again.' }
  }
}
