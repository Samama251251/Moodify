import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const suggestionSchema = z.object({
  suggestions: z
    .array(
      z.object({
        type: z.enum(['breathing', 'journaling', 'activity']),
        title: z.string(),
        description: z.string(),
        duration: z.string(),
      })
    )
    .min(1)
    .max(3),
})

export async function POST(req: Request) {
  try {
    const { moodData } = await req.json()

    const anthropic = createAnthropic({
      apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
    })

    const { object } = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      schema: suggestionSchema,
      prompt: `You are a compassionate mental wellness coach. Based on this mood data from the past 7 days, generate 1-3 personalized wellness suggestions.

Mood data: ${JSON.stringify(moodData)}

Generate suggestions that are:
- Specific and actionable (not generic)
- Matched to the user's emotional patterns
- Either breathing exercises, journaling prompts, or activities
- Warm, supportive tone
- Duration: realistic (5-20 minutes)
- Mix the types: aim for variety across breathing, journaling, and activity`,
    })

    return Response.json(object)
  } catch (error) {
    console.error('Suggestions API error:', error)
    return Response.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
