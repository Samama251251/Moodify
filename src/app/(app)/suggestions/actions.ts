'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { suggestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function saveSuggestion(data: {
  content: string
  type: 'breathing' | 'journaling' | 'activity'
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const [row] = await db
      .insert(suggestions)
      .values({
        userId: user.id,
        content: data.content,
        type: data.type,
        engaged: false,
      })
      .returning({ id: suggestions.id })

    return { success: true, id: row.id }
  } catch (err) {
    console.error('saveSuggestion error:', err)
    return { success: false, error: 'Failed to save suggestion' }
  }
}

export async function markSuggestionEngaged(id: string): Promise<void> {
  try {
    await db
      .update(suggestions)
      .set({ engaged: true })
      .where(eq(suggestions.id, id))
  } catch (err) {
    console.error('markSuggestionEngaged error:', err)
  }
}

export async function rateSuggestion(id: string, helpful: boolean): Promise<void> {
  try {
    await db
      .update(suggestions)
      .set({ helpful })
      .where(eq(suggestions.id, id))
    revalidatePath('/suggestions')
  } catch (err) {
    console.error('rateSuggestion error:', err)
  }
}
