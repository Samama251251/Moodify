'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { mp } from '@/lib/mixpanel'

const moods = [
  { level: 1, emoji: '😞', label: 'Awful' },
  { level: 2, emoji: '😕', label: 'Bad' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '🙂', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Great' },
]

const moodColors: Record<number, string> = {
  1: '#EF4444',
  2: '#F97316',
  3: '#EAB308',
  4: '#84CC16',
  5: '#22C55E',
}

interface TodayEntry {
  id: string
  moodLevel: number
  loggedAt: Date | null
}

interface QuickMoodCardProps {
  todayEntries?: TodayEntry[]
}

function getAvgMood(entries: TodayEntry[]) {
  if (entries.length === 0) return null
  const sum = entries.reduce((a, e) => a + e.moodLevel, 0)
  return Math.round(sum / entries.length)
}

export function QuickMoodCard({ todayEntries = [] }: QuickMoodCardProps) {
  const avgMood = getAvgMood(todayEntries)
  const moodInfo = avgMood ? moods.find((m) => m.level === avgMood) : null

  if (todayEntries.length > 0 && moodInfo) {
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-white/80 backdrop-blur-[12px] border border-white/60 shadow-[0px_20px_40px_rgba(125,87,0,0.06)] p-6 lg:p-8 flex flex-col gap-4">
        <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[rgba(255,210,100,0.2)] blur-[40px] pointer-events-none" />

        <h3 className="text-[18px] lg:text-[22px] font-semibold text-[#7d5700] leading-[1.3] relative">
          Today&apos;s Mood
        </h3>

        <div className="flex items-center gap-4 relative">
          <div
            className="flex items-center justify-center size-20 rounded-[20px] text-[44px] shrink-0"
            style={{ background: `${moodColors[moodInfo.level]}18` }}
          >
            {moodInfo.emoji}
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#1d1c12] leading-none" style={{ color: moodColors[moodInfo.level] }}>
              {moodInfo.label}
            </p>
            <p className="text-[13px] text-[#504534] mt-1">
              {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'} logged today
            </p>
            <p className="text-[12px] text-[#b5a08a] mt-0.5">
              Avg mood level: {avgMood}/5
            </p>
          </div>
        </div>

        <Link
          href="/log-mood"
          onClick={() => mp.track('quick_mood_add_another_clicked')}
          className="w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-[15px] bg-[#f9f3e3] text-[#7d5700] hover:bg-[#f0e8d4] transition-colors duration-200 min-h-[52px] sm:min-h-[44px] relative"
        >
          <span>Log Another</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-white/80 backdrop-blur-[12px] border border-white/60 shadow-[0px_20px_40px_rgba(125,87,0,0.06)] p-6 lg:p-8 flex flex-col gap-5">
      {/* Decorative glow */}
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[rgba(255,210,100,0.2)] blur-[40px] pointer-events-none" />

      <h3 className="text-[18px] lg:text-[22px] font-semibold text-[#7d5700] leading-[1.3] relative">
        How are you feeling right now?
      </h3>

      {/* Emoji preview row */}
      <div className="flex items-center justify-between px-1 relative">
        {moods.map((mood) => (
          <div
            key={mood.level}
            className="flex flex-col items-center gap-1.5 opacity-50 min-w-[44px] min-h-[44px] justify-center rounded-2xl py-2 px-1"
          >
            <span className="select-none text-[32px]">{mood.emoji}</span>
          </div>
        ))}
      </div>

      <p className="text-[13px] text-[#504534] text-center relative">
        You haven&apos;t logged your mood today yet
      </p>

      <Link
        href="/log-mood"
        onClick={() => mp.track('quick_mood_log_clicked')}
        className="w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-[15px] bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white shadow-[0px_8px_20px_rgba(125,87,0,0.2)] hover:shadow-[0px_12px_24px_rgba(125,87,0,0.25)] active:scale-[0.98] transition-all duration-200 min-h-[52px] sm:min-h-[44px] relative"
      >
        <span>Log Your Mood</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}
