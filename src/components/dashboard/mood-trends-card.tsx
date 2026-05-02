'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const ghostData = [
  { day: 'Mon', avgMood: 3.2 },
  { day: 'Tue', avgMood: 2.5 },
  { day: 'Wed', avgMood: 3.8 },
  { day: 'Thu', avgMood: 2.8 },
  { day: 'Fri', avgMood: 4.2 },
  { day: 'Sat', avgMood: 3.5 },
  { day: 'Sun', avgMood: 4.5 },
]

interface WeeklyDataPoint {
  date: string
  day: string
  avgMood: number
}

interface MoodTrendsCardProps {
  weeklyData?: WeeklyDataPoint[]
  totalEntries?: number
}

export function MoodTrendsCard({ weeklyData, totalEntries = 0 }: MoodTrendsCardProps) {
  // Only show real data if there are at least 3 logged entries
  const hasEnoughData = totalEntries >= 3
  const realPoints = weeklyData?.filter((d) => d.avgMood > 0) ?? []
  const hasData = hasEnoughData && realPoints.length >= 2

  // For chart display: use real data if available, otherwise ghost
  const chartData: { day: string; mood: number | null; date?: string; avgMood?: number }[] = hasData
    ? (weeklyData?.map((d) => ({ day: d.day, date: d.date, avgMood: d.avgMood, mood: d.avgMood > 0 ? d.avgMood : null })) ?? ghostData.map((d) => ({ ...d, mood: d.avgMood })))
    : ghostData.map((d) => ({ ...d, mood: d.avgMood }))

  return (
    <div className="rounded-[28px] bg-[#f9f3e3] shadow-[0px_20px_20px_rgba(125,87,0,0.06)] p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[20px] lg:text-[26px] font-semibold text-[#1d1c12] tracking-[-0.5px]">
            Your Week in View
          </h3>
          <p className="text-[13px] lg:text-[15px] text-[#504534] mt-1">
            A gentle look at your emotional rhythms.
          </p>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative mt-6">
        {/* Overlay when no data */}
        {!hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 pointer-events-none">
            <p className="text-[14px] font-semibold text-[#504534]">
              Log at least 3 mood entries
            </p>
            <p className="text-[12px] text-[#827562]">
              to see your weekly trend
            </p>
          </div>
        )}

        <div className={!hasData ? 'opacity-20 select-none pointer-events-none' : ''}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="moodAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e5a623" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#e5a623" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid
                horizontal
                vertical={false}
                stroke="rgba(213,196,174,0.25)"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#504534', fontWeight: 500, fontFamily: 'var(--font-plus-jakarta)' }}
                dy={8}
              />
              <YAxis domain={[1, 5]} hide />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(213,196,174,0.4)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(125,87,0,0.10)',
                  padding: '8px 14px',
                  fontSize: '13px',
                  color: '#504534',
                  fontWeight: 600,
                }}
                itemStyle={{ color: '#7d5700' }}
                labelStyle={{ color: '#504534', fontWeight: 700, marginBottom: 2 }}
                cursor={{ stroke: 'rgba(229,166,35,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(value: unknown) => [typeof value === 'number' ? value.toFixed(1) : String(value), 'Avg Mood']}
              />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#e5a623"
                strokeWidth={2.5}
                fill="url(#moodAreaGradient)"
                connectNulls={false}
                dot={{ fill: '#ffffff', stroke: '#e5a623', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#e5a623', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function MoodTrendsCardSkeleton() {
  return (
    <div className="rounded-[28px] bg-[#f9f3e3] p-6 lg:p-8 h-[320px] animate-pulse">
      <div className="h-6 w-44 bg-[rgba(213,196,174,0.4)] rounded-full mb-2" />
      <div className="h-4 w-64 bg-[rgba(213,196,174,0.3)] rounded-full mb-8" />
      <div className="h-[180px] bg-[rgba(213,196,174,0.2)] rounded-2xl" />
    </div>
  )
}
