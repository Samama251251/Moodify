'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Flame, TrendingUp } from 'lucide-react'

const badgeLabels: Record<string, { label: string; emoji: string }> = {
  first_log: { label: 'First Log', emoji: '🌱' },
  '7_day_streak': { label: '7-Day Streak', emoji: '🔥' },
  '30_day_streak': { label: '30-Day Streak', emoji: '🏆' },
  '30_logs': { label: '30 Entries', emoji: '📖' },
  '100_logs': { label: '100 Entries', emoji: '💯' },
  first_assessment: { label: 'First Assessment', emoji: '🧠' },
}

interface InsightsCardProps {
  currentStreak?: number
  longestStreak?: number
  totalEntries?: number
  recentBadges?: string[]
}

export function InsightsCard({
  currentStreak = 0,
  longestStreak = 0,
  totalEntries = 0,
  recentBadges = [],
}: InsightsCardProps) {
  return (
    <div className="rounded-[28px] bg-white shadow-[0px_20px_20px_rgba(125,87,0,0.06)] p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5 lg:mb-6">
        <div className="flex items-center justify-center size-7">
          <Sparkles className="size-5 text-[#e5a623]" strokeWidth={1.5} />
        </div>
        <h3 className="text-[20px] lg:text-[26px] font-semibold text-[#1d1c12] tracking-[-0.5px]">
          Your Progress
        </h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Current streak */}
        <div className="flex flex-col gap-2 bg-[#fff9e9] rounded-[20px] p-5">
          <div className="flex items-center justify-center size-11 rounded-full bg-[rgba(229,166,35,0.15)] shrink-0">
            <Flame className="size-5 text-[#e5a623]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#1d1c12] leading-none">{currentStreak}</p>
            <p className="text-[13px] text-[#504534] mt-1">Day streak</p>
          </div>
          {longestStreak > 0 && (
            <p className="text-[11px] text-[#b5a08a]">Best: {longestStreak} days</p>
          )}
        </div>

        {/* Total entries */}
        <div className="flex flex-col gap-2 bg-[#fff9e9] rounded-[20px] p-5">
          <div className="flex items-center justify-center size-11 rounded-full bg-[rgba(76,175,130,0.15)] shrink-0">
            <TrendingUp className="size-5 text-[#4CAF82]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#1d1c12] leading-none">{totalEntries}</p>
            <p className="text-[13px] text-[#504534] mt-1">Total entries</p>
          </div>
          {totalEntries < 3 && (
            <p className="text-[11px] text-[#b5a08a]">Log {3 - totalEntries} more to unlock insights</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-2 bg-[#fff9e9] rounded-[20px] p-5">
          <p className="text-[13px] font-semibold text-[#7d5700] mb-1">Recent Badges</p>
          {recentBadges.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentBadges.slice(0, 3).map((badge) => {
                const info = badgeLabels[badge] ?? { label: badge, emoji: '🏅' }
                return (
                  <div key={badge} className="flex items-center gap-2">
                    <span className="text-[18px]">{info.emoji}</span>
                    <span className="text-[12px] text-[#504534] font-medium">{info.label}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[12px] text-[#b5a08a] leading-[1.5]">
              Keep logging to earn your first badge!
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/insights"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#7d5700] hover:gap-2.5 transition-all duration-150 min-h-[44px]"
      >
        View full insights
        <ArrowRight size={13} />
      </Link>
    </div>
  )
}
