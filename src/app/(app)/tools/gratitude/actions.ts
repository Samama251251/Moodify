'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { gratitudeLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface GratitudeLog {
  id: string
  items: string[]
  loggedAt: Date | null
}

export async function saveGratitudeLog(
  items: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Validate
    const cleaned = items.map((i) => i.trim()).filter((i) => i.length >= 3)
    if (cleaned.length < 3) {
      return { success: false, error: 'Please fill in at least 3 gratitude items (min 3 characters each)' }
    }

    await db.insert(gratitudeLogs).values({
      userId: user.id,
      items: cleaned,
    })

    revalidatePath('/tools/gratitude')
    return { success: true }
  } catch (err) {
    console.error('saveGratitudeLog error:', err)
    return { success: false, error: 'Failed to save. Please try again.' }
  }
}

export async function getRecentGratitudeLogs(): Promise<GratitudeLog[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const rows = await db
      .select()
      .from(gratitudeLogs)
      .where(eq(gratitudeLogs.userId, user.id))
      .orderBy(desc(gratitudeLogs.loggedAt))
      .limit(7)

    return rows.map((r) => ({
      id: r.id,
      items: r.items,
      loggedAt: r.loggedAt,
    }))
  } catch {
    return []
  }
}
