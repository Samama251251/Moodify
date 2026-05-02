'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import {
  profiles,
  notifications,
  moodEntries,
  emotionTags,
  activityTags,
  assessments,
  gratitudeLogs,
  suggestions,
  streaks,
  achievements,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateDisplayName(
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    await db
      .update(profiles)
      .set({ fullName: name })
      .where(eq(profiles.id, user.id))

    // Also update Supabase auth metadata
    await supabase.auth.updateUser({
      data: { full_name: name },
    })

    revalidatePath('/settings')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('updateDisplayName error:', err)
    return { success: false, error: 'Failed to update name.' }
  }
}

export async function updateNotificationSettings(
  isEnabled: boolean,
  scheduledTime: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    await db
      .insert(notifications)
      .values({
        userId: user.id,
        isEnabled,
        scheduledTime,
      })
      .onConflictDoUpdate({
        target: notifications.userId,
        set: { isEnabled, scheduledTime },
      })

    revalidatePath('/settings')
    return { success: true }
  } catch (err) {
    console.error('updateNotificationSettings error:', err)
    return { success: false, error: 'Failed to save notification settings.' }
  }
}

export async function getNotificationSettings(): Promise<{
  isEnabled: boolean
  scheduledTime: string | null
} | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const result = await db
    .select({
      isEnabled: notifications.isEnabled,
      scheduledTime: notifications.scheduledTime,
    })
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .limit(1)

  return result[0] ? {
    isEnabled: result[0].isEnabled ?? false,
    scheduledTime: result[0].scheduledTime,
  } : null
}

export async function getProfile(): Promise<{
  fullName: string | null
  email: string | null
} | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return {
    fullName: user.user_metadata?.full_name ?? null,
    email: user.email ?? null,
  }
}

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const userId = user.id

    // Delete all user data in order (foreign keys cascade, but let's be explicit)
    await Promise.all([
      db.delete(achievements).where(eq(achievements.userId, userId)),
      db.delete(streaks).where(eq(streaks.userId, userId)),
      db.delete(suggestions).where(eq(suggestions.userId, userId)),
      db.delete(gratitudeLogs).where(eq(gratitudeLogs.userId, userId)),
      db.delete(assessments).where(eq(assessments.userId, userId)),
      db.delete(notifications).where(eq(notifications.userId, userId)),
    ])

    // Get all mood entry IDs first
    const entries = await db
      .select({ id: moodEntries.id })
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))

    const entryIds = entries.map((e) => e.id)

    // Delete mood-related data
    for (const entryId of entryIds) {
      await db.delete(emotionTags).where(eq(emotionTags.entryId, entryId))
      await db.delete(activityTags).where(eq(activityTags.entryId, entryId))
    }

    await db.delete(moodEntries).where(eq(moodEntries.userId, userId))
    await db.delete(profiles).where(eq(profiles.id, userId))

    // Delete the auth user via admin (requires service role)
    const supabaseAdmin = await createClient()
    await supabaseAdmin.auth.admin.deleteUser(userId)

    redirect('/login')
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) {
      throw err
    }
    console.error('deleteAccount error:', err)
    return { success: false, error: 'Failed to delete account.' }
  }
}
