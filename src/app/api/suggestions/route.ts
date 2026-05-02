import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

const gateway = createOpenAI({
  baseURL: 'https://ai-gateway.vercel.sh/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

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

    const { object } = await generateObject({
      model: gateway('google/gemini-2.0-flash'),
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
