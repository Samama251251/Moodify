'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import {
  moodEntries,
  emotionTags,
  activityTags,
  streaks,
  achievements,
} from '@/lib/db/schema'
import { eq, desc, and, gte } from 'drizzle-orm'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export interface DashboardData {
  todayEntries: { id: string; moodLevel: number; loggedAt: Date | null }[]
  weeklyData: { date: string; day: string; avgMood: number }[]
  currentStreak: number
  longestStreak: number
  totalEntries: number
  recentBadges: string[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      todayEntries: [],
      weeklyData: [],
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      recentBadges: [],
    }
  }

  const userId = user.id
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekAgo = subDays(now, 6)

  // Today's entries
  const todayRows = await db
    .select({
      id: moodEntries.id,
      moodLevel: moodEntries.moodLevel,
      loggedAt: moodEntries.loggedAt,
    })
    .from(moodEntries)
    .where(
      and(
        eq(moodEntries.userId, userId),
        eq(moodEntries.isDraft, false),
        gte(moodEntries.loggedAt, todayStart),
      ),
    )
    .orderBy(desc(moodEntries.loggedAt))

  // Weekly entries for sparkline (last 7 days)
  const weekRows = await db
    .select({
      id: moodEntries.id,
      moodLevel: moodEntries.moodLevel,
      loggedAt: moodEntries.loggedAt,
    })
    .from(moodEntries)
    .where(
      and(
        eq(moodEntries.userId, userId),
        eq(moodEntries.isDraft, false),
        gte(moodEntries.loggedAt, weekAgo),
      ),
    )
    .orderBy(moodEntries.loggedAt)

  // Total entries
  const allRows = await db
    .select({ id: moodEntries.id })
    .from(moodEntries)
    .where(and(eq(moodEntries.userId, userId), eq(moodEntries.isDraft, false)))

  const totalEntries = allRows.length

  // Streak data
  const streakRow = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1)

  const currentStreak = streakRow[0]?.currentStreak ?? 0
  const longestStreak = streakRow[0]?.longestStreak ?? 0

  // Recent badges (last 3)
  const badgeRows = await db
    .select({ badge: achievements.badge })
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.awardedAt))
    .limit(3)

  const recentBadges = badgeRows.map((r) => r.badge)

  // Build weekly chart: group by calendar day, avg mood
  const dayMap: Record<string, number[]> = {}
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i)
    const key = format(d, 'yyyy-MM-dd')
    dayMap[key] = []
  }
  for (const row of weekRows) {
    if (!row.loggedAt) continue
    const key = format(row.loggedAt, 'yyyy-MM-dd')
    if (key in dayMap) {
      dayMap[key].push(row.moodLevel)
    }
  }

  const weeklyData = Object.entries(dayMap).map(([dateStr, levels]) => {
    const d = new Date(dateStr + 'T00:00:00')
    return {
      date: dateStr,
      day: format(d, 'EEE'),
      avgMood: levels.length > 0 ? +(levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1) : 0,
    }
  })

  // Filter today's entries to be within today
  const filteredToday = todayRows.filter((r) => {
    if (!r.loggedAt) return false
    return r.loggedAt >= todayStart && r.loggedAt <= todayEnd
  })

  return {
    todayEntries: filteredToday,
    weeklyData,
    currentStreak,
    longestStreak,
    totalEntries,
    recentBadges,
  }
}

// ---- Insights data ----

export interface RawEntry {
  id: string
  moodLevel: number
  loggedAt: Date | null
  note: string | null
  emotionTags: string[]
  activityTags: string[]
}

export async function getInsightsData(): Promise<{
  entries: RawEntry[]
  currentStreak: number
  longestStreak: number
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { entries: [], currentStreak: 0, longestStreak: 0 }

  const userId = user.id

  const rows = await db
    .select({
      id: moodEntries.id,
      moodLevel: moodEntries.moodLevel,
      loggedAt: moodEntries.loggedAt,
      note: moodEntries.note,
      emotionTag: emotionTags.tag,
      activityTag: activityTags.activity,
    })
    .from(moodEntries)
    .leftJoin(emotionTags, eq(emotionTags.entryId, moodEntries.id))
    .leftJoin(activityTags, eq(activityTags.entryId, moodEntries.id))
    .where(and(eq(moodEntries.userId, userId), eq(moodEntries.isDraft, false)))
    .orderBy(desc(moodEntries.loggedAt))

  // Merge multiple rows per entry (from joins)
  const entryMap = new Map<string, RawEntry>()
  for (const row of rows) {
    if (!entryMap.has(row.id)) {
      entryMap.set(row.id, {
        id: row.id,
        moodLevel: row.moodLevel,
        loggedAt: row.loggedAt,
        note: row.note,
        emotionTags: [],
        activityTags: [],
      })
    }
    const entry = entryMap.get(row.id)!
    if (row.emotionTag && !entry.emotionTags.includes(row.emotionTag)) {
      entry.emotionTags.push(row.emotionTag)
    }
    if (row.activityTag && !entry.activityTags.includes(row.activityTag)) {
      entry.activityTags.push(row.activityTag)
    }
  }

  const entries = Array.from(entryMap.values())

  const streakRow = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1)

  return {
    entries,
    currentStreak: streakRow[0]?.currentStreak ?? 0,
    longestStreak: streakRow[0]?.longestStreak ?? 0,
  }
}
