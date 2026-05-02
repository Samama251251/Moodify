'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { assessments, achievements } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface AssessmentRecord {
  id: string
  type: string
  score: number
  severityLabel: string
  takenAt: Date | null
  answers: unknown
}

export async function saveAssessment(
  type: 'PHQ9' | 'GAD7',
  answers: number[],
  score: number,
  severityLabel: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const userId = user.id

    const [assessment] = await db
      .insert(assessments)
      .values({
        userId,
        type,
        answers,
        score,
        severityLabel,
      })
      .returning({ id: assessments.id })

    // Award first_assessment achievement if applicable
    const existing = await db
      .select({ badge: achievements.badge })
      .from(achievements)
      .where(eq(achievements.userId, userId))

    const badgeSet = new Set(existing.map((a) => a.badge))
    if (!badgeSet.has('first_assessment')) {
      await db.insert(achievements).values({
        userId,
        badge: 'first_assessment',
      })
    }

    revalidatePath('/assessments')
    return { success: true, id: assessment.id }
  } catch (err) {
    console.error('saveAssessment error:', err)
    return { success: false, error: 'Failed to save assessment.' }
  }
}

export async function getAssessmentHistory(
  type: 'PHQ9' | 'GAD7'
): Promise<AssessmentRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const results = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.userId, user.id), eq(assessments.type, type)))
    .orderBy(desc(assessments.takenAt))
    .limit(5)

  return results as AssessmentRecord[]
}

export async function getAllAssessmentHistory(): Promise<AssessmentRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const results = await db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, user.id))
    .orderBy(desc(assessments.takenAt))
    .limit(10)

  return results as AssessmentRecord[]
}

export async function getLastAssessmentTime(
  type: 'PHQ9' | 'GAD7'
): Promise<Date | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const results = await db
    .select({ takenAt: assessments.takenAt })
    .from(assessments)
    .where(and(eq(assessments.userId, user.id), eq(assessments.type, type)))
    .orderBy(desc(assessments.takenAt))
    .limit(1)

  return results[0]?.takenAt ?? null
}
