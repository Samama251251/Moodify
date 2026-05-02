'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { moodEntries, emotionTags, activityTags, assessments } from '@/lib/db/schema'
import { eq, and, gte, desc, inArray } from 'drizzle-orm'

export type DateRange = '7d' | '30d' | '3m' | 'all'

export interface MoodEntryExport {
  id: string
  loggedAt: Date | null
  moodLevel: number
  note: string | null
  emotions: string[]
  activities: string[]
}

export interface AssessmentExport {
  id: string
  type: string
  score: number
  severityLabel: string
  takenAt: Date | null
}

export interface ExportData {
  moodEntries: MoodEntryExport[]
  assessments: AssessmentExport[]
  userName: string
  exportedAt: Date
  dateRange: DateRange
}

function getStartDate(range: DateRange): Date | null {
  const now = new Date()
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '3m':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case 'all':
      return null
  }
}

export async function getExportData(dateRange: DateRange): Promise<ExportData | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const userId = user.id
  const startDate = getStartDate(dateRange)

  // Fetch mood entries
  const entriesQuery = startDate
    ? db
        .select()
        .from(moodEntries)
        .where(and(eq(moodEntries.userId, userId), gte(moodEntries.loggedAt, startDate)))
        .orderBy(desc(moodEntries.loggedAt))
    : db
        .select()
        .from(moodEntries)
        .where(eq(moodEntries.userId, userId))
        .orderBy(desc(moodEntries.loggedAt))

  const entries = await entriesQuery

  // Fetch emotion and activity tags for all entries
  const entryIds = entries.map((e) => e.id)

  let emotions: { entryId: string; tag: string }[] = []
  let activities: { entryId: string; activity: string }[] = []

  if (entryIds.length > 0) {
    const [emotionResults, activityResults] = await Promise.all([
      db
        .select({ entryId: emotionTags.entryId, tag: emotionTags.tag })
        .from(emotionTags)
        .where(inArray(emotionTags.entryId, entryIds)),
      db
        .select({ entryId: activityTags.entryId, activity: activityTags.activity })
        .from(activityTags)
        .where(inArray(activityTags.entryId, entryIds)),
    ])
    emotions = emotionResults
    activities = activityResults
  }

  // Group tags by entry
  const emotionsByEntry = new Map<string, string[]>()
  const activitiesByEntry = new Map<string, string[]>()

  for (const e of emotions) {
    const existing = emotionsByEntry.get(e.entryId) ?? []
    existing.push(e.tag)
    emotionsByEntry.set(e.entryId, existing)
  }

  for (const a of activities) {
    const existing = activitiesByEntry.get(a.entryId) ?? []
    existing.push(a.activity)
    activitiesByEntry.set(a.entryId, existing)
  }

  // Fetch assessments
  const assessmentQuery = startDate
    ? db
        .select()
        .from(assessments)
        .where(and(eq(assessments.userId, userId), gte(assessments.takenAt, startDate)))
        .orderBy(desc(assessments.takenAt))
    : db
        .select()
        .from(assessments)
        .where(eq(assessments.userId, userId))
        .orderBy(desc(assessments.takenAt))

  const assessmentResults = await assessmentQuery

  const moodEntriesExport: MoodEntryExport[] = entries.map((e) => ({
    id: e.id,
    loggedAt: e.loggedAt,
    moodLevel: e.moodLevel,
    note: e.note,
    emotions: emotionsByEntry.get(e.id) ?? [],
    activities: activitiesByEntry.get(e.id) ?? [],
  }))

  const assessmentsExport: AssessmentExport[] = assessmentResults.map((a) => ({
    id: a.id,
    type: a.type,
    score: a.score,
    severityLabel: a.severityLabel,
    takenAt: a.takenAt,
  }))

  return {
    moodEntries: moodEntriesExport,
    assessments: assessmentsExport,
    userName: user.user_metadata?.full_name ?? user.email ?? 'User',
    exportedAt: new Date(),
    dateRange,
  }
}
