'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { ThumbsUp, ThumbsDown, RefreshCw, Wind, PenLine, Activity, Loader2, Sparkles } from 'lucide-react'
import { mp } from '@/lib/mixpanel'
import { rateSuggestion, markSuggestionEngaged } from './actions'

export interface SuggestionItem {
  id?: string
  type: 'breathing' | 'journaling' | 'activity'
  title: string
  description: string
  duration: string
}

interface SuggestionsClientProps {
  initialSuggestions: SuggestionItem[]
  entryCount: number
  isPersonalized: boolean
}

const typeConfig = {
  breathing: {
    icon: Wind,
    label: 'Breathing',
    cardAccent: 'from-[rgba(255,222,170,0.2)] to-transparent',
    badgeClass: 'bg-[#fff3d6] text-[#7d5700]',
    iconClass: 'text-[#e5a623]',
  },
  journaling: {
    icon: PenLine,
    label: 'Journaling',
    cardAccent: 'from-[rgba(254,210,101,0.2)] to-transparent',
    badgeClass: 'bg-[#fef9e6] text-[#7d5700]',
    iconClass: 'text-[#d4a017]',
  },
  activity: {
    icon: Activity,
    label: 'Activity',
    cardAccent: 'from-[rgba(146,187,161,0.2)] to-transparent',
    badgeClass: 'bg-[#e8f4ec] text-[#2d6b47]',
    iconClass: 'text-[#4CAF82]',
  },
}

function SuggestionCard({
  suggestion,
  onFeedback,
}: {
  suggestion: SuggestionItem
  onFeedback: (id: string | undefined, helpful: boolean) => void
}) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[suggestion.type]
  const Icon = config.icon

  const handleTryIt = () => {
    if (suggestion.id) {
      markSuggestionEngaged(suggestion.id)
    }
    mp.track('suggestion_engaged', { type: suggestion.type })
    if (suggestion.type === 'journaling') {
      setExpanded(true)
    }
  }

  const handleFeedback = (helpful: boolean) => {
    if (feedback) return
    setFeedback(helpful ? 'up' : 'down')
    onFeedback(suggestion.id, helpful)
    mp.track('suggestion_feedback', { type: suggestion.type, helpful })
  }

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0px_8px_24px_rgba(125,87,0,0.08)] relative overflow-hidden flex flex-col gap-4">
      {/* Decorative corner */}
      <div
        className={`absolute right-[-32px] top-[-32px] size-[100px] rounded-bl-full bg-gradient-to-bl ${config.cardAccent}`}
      />

      {/* Header */}
      <div className="flex items-start gap-3 relative z-10">
        <div className={`flex items-center justify-center size-10 rounded-2xl bg-[#f9f3e3] shrink-0`}>
          <Icon className={`size-5 ${config.iconClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
              {config.label}
            </span>
            <span className="text-xs text-[#b5a08a] bg-[#f9f3e3] px-2.5 py-0.5 rounded-full font-medium">
              {suggestion.duration}
            </span>
          </div>
          <h3 className="text-[#1d1c12] font-bold text-lg leading-tight mt-1.5">
            {suggestion.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#504534] text-sm leading-relaxed relative z-10">
        {suggestion.description}
      </p>

      {/* Journaling expanded prompt */}
      {expanded && suggestion.type === 'journaling' && (
        <div className="bg-[#f9f3e3] rounded-xl p-4 relative z-10">
          <p className="text-[#7d5700] text-xs font-semibold mb-2 uppercase tracking-wide">Your prompt</p>
          <p className="text-[#504534] text-sm italic leading-relaxed">{suggestion.description}</p>
          <textarea
            className="w-full mt-3 bg-white rounded-lg p-3 text-sm text-[#504534] border border-[#e8e2d3] focus:outline-none focus:border-[#e5a623] resize-none min-h-[80px] text-base"
            placeholder="Start writing..."
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between relative z-10">
        {suggestion.type === 'breathing' ? (
          <Link
            href="/breathing"
            onClick={handleTryIt}
            className="bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-[0px_6px_12px_rgba(125,87,0,0.2)] active:scale-95 transition-transform min-h-[44px] flex items-center"
          >
            Try It
          </Link>
        ) : (
          <button
            onClick={handleTryIt}
            className="bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-[0px_6px_12px_rgba(125,87,0,0.2)] active:scale-95 transition-transform min-h-[44px]"
          >
            Try It
          </button>
        )}

        {/* Feedback */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#b5a08a] mr-1">Helpful?</span>
          <button
            onClick={() => handleFeedback(true)}
            disabled={!!feedback}
            className={`size-9 rounded-full flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
              feedback === 'up'
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-[#f9f3e3] text-[#b5a08a] hover:text-[#7d5700]'
            } disabled:cursor-not-allowed`}
            aria-label="Helpful"
          >
            <ThumbsUp className="size-4" />
          </button>
          <button
            onClick={() => handleFeedback(false)}
            disabled={!!feedback}
            className={`size-9 rounded-full flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
              feedback === 'down'
                ? 'bg-red-100 text-red-500'
                : 'hover:bg-[#f9f3e3] text-[#b5a08a] hover:text-[#7d5700]'
            } disabled:cursor-not-allowed`}
            aria-label="Not helpful"
          >
            <ThumbsDown className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function SuggestionsClient({
  initialSuggestions,
  entryCount,
  isPersonalized,
}: SuggestionsClientProps) {
  const [suggestionList, setSuggestionList] = useState<SuggestionItem[]>(initialSuggestions)
  const [isRefreshing, startRefresh] = useTransition()

  const handleRefresh = useCallback(() => {
    startRefresh(async () => {
      try {
        const res = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moodData: { entryCount, note: 'manual refresh' } }),
        })
        if (res.ok) {
          const data = await res.json()
          setSuggestionList(data.suggestions)
          mp.track('suggestion_viewed', { type: 'refresh', count: data.suggestions.length })
        }
      } catch {
        // silently fail — keep existing suggestions
      }
    })
  }, [entryCount])

  const handleFeedback = useCallback((id: string | undefined, helpful: boolean) => {
    if (id) {
      rateSuggestion(id, helpful)
    }
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#7d5700] tracking-tight leading-tight">
            Your Wellness Suggestions
          </h1>
          <p className="text-[#504534] mt-2 text-base leading-relaxed">
            {isPersonalized
              ? 'Personalized based on your last 7 days of mood data.'
              : `Generic tips — log ${5 - entryCount} more ${5 - entryCount === 1 ? 'entry' : 'entries'} to personalize.`}
          </p>
          {!isPersonalized && entryCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 rounded-full bg-[#e8e2d3] flex-1 max-w-[160px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7d5700] to-[#e5a623] transition-all"
                  style={{ width: `${(entryCount / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[#b5a08a]">{entryCount}/5</span>
            </div>
          )}
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-[#f9f3e3] hover:bg-[#e8e2d3] text-[#7d5700] font-semibold px-4 py-2.5 rounded-full text-sm transition-colors min-h-[44px] shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Personalization badge */}
      {isPersonalized && (
        <div className="flex items-center gap-2 mb-6 bg-[#f9f3e3] rounded-full px-4 py-2 w-fit">
          <Sparkles className="size-4 text-[#e5a623]" />
          <span className="text-[#7d5700] text-sm font-medium">AI-Personalized for you</span>
        </div>
      )}

      {/* Suggestion cards */}
      {isRefreshing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] p-6 shadow-[0px_8px_24px_rgba(125,87,0,0.08)] h-[240px] animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-2xl bg-[#f9f3e3]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#f9f3e3] rounded-full w-20" />
                  <div className="h-5 bg-[#f9f3e3] rounded-full w-36" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-[#f9f3e3] rounded-full w-full" />
                <div className="h-3 bg-[#f9f3e3] rounded-full w-4/5" />
                <div className="h-3 bg-[#f9f3e3] rounded-full w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suggestionList.map((suggestion, index) => (
            <SuggestionCard
              key={suggestion.id ?? index}
              suggestion={suggestion}
              onFeedback={handleFeedback}
            />
          ))}
        </div>
      )}

      {/* Recent activity section placeholder */}
      {isPersonalized && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-[#7d5700] mb-4">Why these suggestions?</h2>
          <div className="bg-[#f9f3e3] rounded-2xl p-5">
            <p className="text-[#504534] text-sm leading-relaxed">
              These suggestions are generated based on your mood patterns over the last 7 days.
              As you log more entries, the recommendations become increasingly tailored to your
              emotional rhythms and lifestyle habits.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
