'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { mp } from '@/lib/mixpanel'
import { YearInPixels, type DayData } from './year-in-pixels'
import type { RawEntry } from '@/app/(app)/actions'

type Period = 'week' | 'month' | 'year'
type Tab = 'overview' | 'year_in_pixels'

const MOOD_COLORS: Record<number, string> = {
  1: '#EF4444',
  2: '#F97316',
  3: '#EAB308',
  4: '#84CC16',
  5: '#22C55E',
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Awful',
  2: 'Bad',
  3: 'Neutral',
  4: 'Good',
  5: 'Great',
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

interface InsightsClientProps {
  entries: RawEntry[]
  currentStreak: number
  longestStreak: number
}

function filterByPeriod(entries: RawEntry[], period: Period): RawEntry[] {
  const now = new Date()
  let cutoff: Date
  if (period === 'week') cutoff = startOfWeek(now, { weekStartsOn: 1 })
  else if (period === 'month') cutoff = startOfMonth(now)
  else cutoff = startOfYear(now)

  return entries.filter((e) => e.loggedAt && new Date(e.loggedAt) >= cutoff)
}

function buildTrendData(entries: RawEntry[], period: Period) {
  const now = new Date()
  const dayMap = new Map<string, number[]>()

  let days = 7
  if (period === 'month') days = 30
  if (period === 'year') days = 365

  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(now, i)
    const key = format(d, 'yyyy-MM-dd')
    dayMap.set(key, [])
  }

  for (const entry of entries) {
    if (!entry.loggedAt) continue
    const key = format(new Date(entry.loggedAt), 'yyyy-MM-dd')
    if (dayMap.has(key)) {
      dayMap.get(key)!.push(entry.moodLevel)
    }
  }

  const labelFormat = period === 'week' ? 'EEE' : period === 'month' ? 'd' : 'MMM'

  return Array.from(dayMap.entries())
    .map(([dateStr, levels]) => ({
      label: format(new Date(dateStr + 'T00:00:00'), labelFormat),
      avgMood: levels.length > 0 ? +(levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(2) : null,
    }))
    .filter((_, idx, arr) => {
      // For year view, only show month boundaries to avoid overcrowding
      if (period !== 'year') return true
      return idx % 30 === 0 || idx === arr.length - 1
    })
}

function buildMoodDistribution(entries: RawEntry[]) {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const e of entries) counts[e.moodLevel] = (counts[e.moodLevel] ?? 0) + 1
  const total = entries.length || 1
  return [1, 2, 3, 4, 5].map((level) => ({
    level,
    count: counts[level],
    pct: Math.round((counts[level] / total) * 100),
    color: MOOD_COLORS[level],
    label: MOOD_LABELS[level],
    emoji: MOOD_EMOJIS[level],
  }))
}

function buildActivityCorrelation(entries: RawEntry[]) {
  const actMap = new Map<string, number[]>()
  for (const entry of entries) {
    for (const act of entry.activityTags) {
      if (!actMap.has(act)) actMap.set(act, [])
      actMap.get(act)!.push(entry.moodLevel)
    }
  }

  return Array.from(actMap.entries())
    .map(([activity, levels]) => ({
      activity,
      avgMood: +(levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(2),
      count: levels.length,
    }))
    .filter((a) => a.count >= 2)
    .sort((a, b) => b.avgMood - a.avgMood)
    .slice(0, 8)
}

function buildEmotionFrequency(entries: RawEntry[]) {
  const freq = new Map<string, number>()
  for (const entry of entries) {
    for (const tag of entry.emotionTags) {
      freq.set(tag, (freq.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, count }))
}

function buildYearDayMap(entries: RawEntry[]): Record<string, DayData> {
  const map: Record<string, RawEntry[]> = {}
  for (const entry of entries) {
    if (!entry.loggedAt) continue
    const key = format(new Date(entry.loggedAt), 'yyyy-MM-dd')
    if (!map[key]) map[key] = []
    map[key].push(entry)
  }

  const result: Record<string, DayData> = {}
  for (const [dateStr, dayEntries] of Object.entries(map)) {
    const avgMood = Math.round(
      dayEntries.reduce((a, e) => a + e.moodLevel, 0) / dayEntries.length,
    )
    const allEmotions = [...new Set(dayEntries.flatMap((e) => e.emotionTags))]
    const allActivities = [...new Set(dayEntries.flatMap((e) => e.activityTags))]
    const note = dayEntries.find((e) => e.note)?.note ?? null
    result[dateStr] = {
      date: dateStr,
      moodLevel: avgMood,
      emotionTags: allEmotions,
      activityTags: allActivities,
      note,
    }
  }
  return result
}

function getAvgMood(entries: RawEntry[]) {
  if (entries.length === 0) return null
  return +(entries.reduce((a, e) => a + e.moodLevel, 0) / entries.length).toFixed(1)
}

function getMoodEmoji(avg: number | null) {
  if (avg === null) return '😐'
  const rounded = Math.round(avg)
  return MOOD_EMOJIS[rounded] ?? '😐'
}

export function InsightsClient({ entries, currentStreak, longestStreak }: InsightsClientProps) {
  const [tab, setTab] = useState<Tab>('overview')
  const [period, setPeriod] = useState<Period>('week')

  const totalEntries = entries.length
  const hasEnoughData = totalEntries >= 3

  useEffect(() => {
    mp.track('insights_viewed', { tab })
  }, [tab])

  const periodEntries = filterByPeriod(entries, period)
  const trendData = buildTrendData(entries, period)
  const distribution = buildMoodDistribution(periodEntries)
  const activityCorr = buildActivityCorrelation(periodEntries)
  const emotionFreq = buildEmotionFrequency(periodEntries)
  const avgMood = getAvgMood(periodEntries)
  const yearDayMap = buildYearDayMap(entries)

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-[28px] sm:text-[36px] font-bold text-[#1d1c12] tracking-[-1px] leading-[1.2]">
          Insights
        </h2>
        <p className="text-[14px] sm:text-[16px] text-[#504534] mt-2 max-w-[480px]">
          Understand your patterns. Celebrate your progress.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 bg-[#f9f3e3] p-1 rounded-full w-fit">
        {(['overview', 'year_in_pixels'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 min-h-[44px] ${
              tab === t
                ? 'bg-white text-[#7d5700] shadow-[0px_4px_12px_rgba(125,87,0,0.12)]'
                : 'text-[#504534] hover:text-[#7d5700]'
            }`}
          >
            {t === 'overview' ? 'Overview' : 'Year in Pixels'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {!hasEnoughData ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center rounded-[28px] bg-[#f9f3e3]">
              <span className="text-[48px]">📊</span>
              <h3 className="text-[20px] font-semibold text-[#1d1c12]">Keep logging to unlock insights</h3>
              <p className="text-[14px] text-[#504534] max-w-[300px]">
                You need at least 3 mood entries. You have {totalEntries} so far.
              </p>
              <Link
                href="/log-mood"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white font-semibold text-[14px] min-h-[48px] shadow-[0px_8px_20px_rgba(125,87,0,0.2)]"
              >
                Log your mood
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Period selector */}
              <div className="flex gap-2">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-200 min-h-[44px] capitalize ${
                      period === p
                        ? 'bg-[#7d5700] text-white'
                        : 'bg-[#f9f3e3] text-[#504534] hover:bg-[#f0e8d4]'
                    }`}
                  >
                    {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
                  </button>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {[
                  {
                    label: 'Avg Mood',
                    value: avgMood !== null ? `${getMoodEmoji(avgMood)} ${avgMood}` : '—',
                    sub: 'out of 5',
                  },
                  {
                    label: 'Entries',
                    value: String(periodEntries.length),
                    sub: `${period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'this year'}`,
                  },
                  {
                    label: 'Current Streak',
                    value: `🔥 ${currentStreak}`,
                    sub: 'days',
                  },
                  {
                    label: 'Best Streak',
                    value: `🏆 ${longestStreak}`,
                    sub: 'days',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1 bg-[#f9f3e3] rounded-[20px] p-4 lg:p-5">
                    <p className="text-[11px] font-semibold text-[#b5a08a] uppercase tracking-wide">{stat.label}</p>
                    <p className="text-[22px] lg:text-[28px] font-bold text-[#1d1c12]">{stat.value}</p>
                    <p className="text-[11px] text-[#504534]">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Mood trend chart */}
              <div className="rounded-[24px] bg-[#f9f3e3] p-5 lg:p-6">
                <h3 className="text-[16px] lg:text-[18px] font-semibold text-[#1d1c12] mb-4">Mood Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#e5a623" />
                        <stop offset="100%" stopColor="#4CAF82" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      horizontal
                      vertical={false}
                      stroke="rgba(213,196,174,0.3)"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#b5a08a', fontWeight: 500 }}
                      dy={8}
                      interval="preserveStartEnd"
                    />
                    <YAxis domain={[1, 5]} hide />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(213,196,174,0.4)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#504534',
                        padding: '8px 12px',
                      }}
                      formatter={(value: unknown) => [typeof value === 'number' ? value.toFixed(1) : String(value), 'Avg Mood']}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgMood"
                      stroke="url(#lineGradient)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#e5a623', stroke: 'white', strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Mood distribution */}
              <div className="rounded-[24px] bg-[#f9f3e3] p-5 lg:p-6">
                <h3 className="text-[16px] lg:text-[18px] font-semibold text-[#1d1c12] mb-4">Mood Distribution</h3>
                <div className="flex flex-col gap-3">
                  {distribution.map((d) => (
                    <div key={d.level} className="flex items-center gap-3">
                      <span className="text-[16px] w-6 shrink-0">{d.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-[#504534]">{d.label}</span>
                          <span className="text-[11px] text-[#b5a08a]">{d.count} ({d.pct}%)</span>
                        </div>
                        <div className="h-2 bg-[rgba(213,196,174,0.3)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${d.pct}%`, background: d.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity correlation */}
              {activityCorr.length > 0 && (
                <div className="rounded-[24px] bg-[#f9f3e3] p-5 lg:p-6">
                  <h3 className="text-[16px] lg:text-[18px] font-semibold text-[#1d1c12] mb-1">Activity Correlation</h3>
                  <p className="text-[12px] text-[#b5a08a] mb-4">Activities ranked by average mood score</p>
                  <ResponsiveContainer width="100%" height={Math.max(activityCorr.length * 36, 120)}>
                    <BarChart
                      layout="vertical"
                      data={activityCorr}
                      margin={{ top: 0, right: 40, left: 60, bottom: 0 }}
                    >
                      <XAxis type="number" domain={[0, 5]} hide />
                      <YAxis
                        type="category"
                        dataKey="activity"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#504534', fontWeight: 500 }}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(213,196,174,0.4)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#504534',
                          padding: '8px 12px',
                        }}
                        formatter={(value: unknown) => [typeof value === 'number' ? value.toFixed(1) : String(value), 'Avg Mood']}
                      />
                      <Bar dataKey="avgMood" radius={[0, 6, 6, 0]} barSize={16}>
                        {activityCorr.map((entry, index) => {
                          const color =
                            entry.avgMood >= 4 ? '#4CAF82' :
                            entry.avgMood >= 3 ? '#F5A623' :
                            '#E991A0'
                          return <Cell key={index} fill={color} />
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Emotion frequency */}
              {emotionFreq.length > 0 && (
                <div className="rounded-[24px] bg-[#f9f3e3] p-5 lg:p-6">
                  <h3 className="text-[16px] lg:text-[18px] font-semibold text-[#1d1c12] mb-4">Top Emotions</h3>
                  <div className="flex flex-wrap gap-2">
                    {emotionFreq.map(({ tag, count }) => {
                      const tagLower = tag.toLowerCase()
                      const bgColor =
                        ['joyful', 'calm', 'happy', 'grateful', 'hopeful', 'content'].includes(tagLower) ? 'rgba(76,175,130,0.12)' :
                        ['energetic', 'focused', 'productive'].includes(tagLower) ? 'rgba(245,166,35,0.15)' :
                        ['anxious', 'overwhelmed', 'sad', 'angry', 'stressed'].includes(tagLower) ? 'rgba(233,145,160,0.15)' :
                        'rgba(213,196,174,0.3)'
                      const textColor =
                        ['joyful', 'calm', 'happy', 'grateful', 'hopeful', 'content'].includes(tagLower) ? '#2d7a58' :
                        ['energetic', 'focused', 'productive'].includes(tagLower) ? '#7d5700' :
                        ['anxious', 'overwhelmed', 'sad', 'angry', 'stressed'].includes(tagLower) ? '#8b3a50' :
                        '#504534'

                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                          style={{ background: bgColor, color: textColor }}
                        >
                          <span className="capitalize">{tag}</span>
                          <span className="opacity-60 text-[10px]">×{count}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'year_in_pixels' && (
        <div className="rounded-[24px] bg-[#f9f3e3] p-5 lg:p-6">
          <div className="mb-4">
            <h3 className="text-[18px] font-semibold text-[#1d1c12]">
              {new Date().getFullYear()} in Pixels
            </h3>
            <p className="text-[12px] text-[#b5a08a] mt-1">
              Each square is one day. Click to see details.
            </p>
          </div>
          <YearInPixels dayMap={yearDayMap} year={new Date().getFullYear()} />
        </div>
      )}
    </div>
  )
}
