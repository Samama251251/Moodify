'use client'

import { useState } from 'react'
import { format, startOfYear, addDays, isSameMonth, isToday } from 'date-fns'
import { mp } from '@/lib/mixpanel'

const JOYFUL_TAGS = ['joyful', 'calm', 'happy', 'grateful', 'hopeful', 'content']
const ENERGETIC_TAGS = ['energetic', 'focused', 'productive']
const TIRED_TAGS = ['tired', 'neutral', 'lonely']
const ANXIOUS_TAGS = ['anxious', 'overwhelmed', 'sad', 'angry', 'stressed']

const PIXEL_COLORS = {
  green: '#4CAF82',
  gold: '#F5A623',
  gray: '#9E9E9E',
  pink: '#E991A0',
  empty: '#E5E7EB',
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export interface DayData {
  date: string // 'yyyy-MM-dd'
  moodLevel: number
  emotionTags: string[]
  activityTags: string[]
  note: string | null
}

interface YearInPixelsProps {
  dayMap: Record<string, DayData>
  year?: number
}

function getPixelColor(day: DayData | undefined): string {
  if (!day) return PIXEL_COLORS.empty

  if (day.emotionTags.length > 0) {
    const primaryTag = day.emotionTags[0].toLowerCase()
    if (JOYFUL_TAGS.includes(primaryTag)) return PIXEL_COLORS.green
    if (ENERGETIC_TAGS.includes(primaryTag)) return PIXEL_COLORS.gold
    if (TIRED_TAGS.includes(primaryTag)) return PIXEL_COLORS.gray
    if (ANXIOUS_TAGS.includes(primaryTag)) return PIXEL_COLORS.pink
  }

  // Fallback to mood level
  if (day.moodLevel >= 4) return PIXEL_COLORS.green
  if (day.moodLevel === 3) return PIXEL_COLORS.gold
  if (day.moodLevel === 2) return PIXEL_COLORS.gray
  return PIXEL_COLORS.pink
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function YearInPixels({ dayMap, year = new Date().getFullYear() }: YearInPixelsProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Build 53 columns × 7 rows grid
  // Start from Jan 1 of the year
  const jan1 = startOfYear(new Date(year, 0, 1))
  // We start our grid from the Sunday before Jan 1 (or Jan 1 itself if it's Sunday)
  const jan1DayOfWeek = jan1.getDay() // 0=Sun, 6=Sat
  const gridStart = addDays(jan1, -jan1DayOfWeek)

  // 53 weeks × 7 days = 371 cells
  const totalCells = 53 * 7
  const cells: Array<{ date: Date; dateStr: string; inYear: boolean }> = []
  for (let i = 0; i < totalCells; i++) {
    const d = addDays(gridStart, i)
    cells.push({
      date: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      inYear: d.getFullYear() === year,
    })
  }

  // Month label positions: find which column each month first appears
  const monthCols: Record<number, number> = {}
  cells.forEach(({ date, inYear }, idx) => {
    if (!inYear) return
    const col = Math.floor(idx / 7)
    const month = date.getMonth()
    if (!(month in monthCols)) {
      monthCols[month] = col
    }
  })

  const selectedDay = selectedDate ? dayMap[selectedDate] : undefined
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null

  return (
    <div className="flex flex-col gap-6">
      {/* Month labels + grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Month labels row */}
          <div className="flex mb-1">
            <div className="w-5 shrink-0" /> {/* day labels offset */}
            <div className="relative flex-1">
              {MONTHS.map((month, mIdx) => {
                const col = monthCols[mIdx]
                if (col === undefined) return null
                return (
                  <span
                    key={month}
                    className="absolute top-0 text-[10px] sm:text-[11px] text-[#b5a08a] font-medium"
                    style={{ left: `${(col / 53) * 100}%` }}
                  >
                    {month}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="flex gap-0.5 mt-4">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center text-[9px] sm:text-[10px] text-[#b5a08a]"
                  style={{ height: '12px', width: '10px' }}
                >
                  {i % 2 === 1 ? label : ''}
                </div>
              ))}
            </div>

            {/* 53 columns */}
            {Array.from({ length: 53 }).map((_, col) => (
              <div key={col} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, row) => {
                  const cellIdx = col * 7 + row
                  const cell = cells[cellIdx]
                  if (!cell) return <div key={row} style={{ width: 12, height: 12 }} />

                  const day = dayMap[cell.dateStr]
                  const color = cell.inYear ? getPixelColor(day) : 'transparent'
                  const today = isToday(cell.date)
                  const isSelected = selectedDate === cell.dateStr
                  const hasEntry = !!day && cell.inYear

                  return (
                    <button
                      key={row}
                      title={cell.inYear ? format(cell.date, 'MMM d, yyyy') : ''}
                      onClick={() => {
                        if (!cell.inYear) return
                        const newDate = isSelected ? null : cell.dateStr
                        setSelectedDate(newDate)
                        mp.track('year_in_pixels_day_clicked', {
                          has_entry: hasEntry,
                          date: cell.dateStr,
                        })
                      }}
                      className="rounded-sm transition-transform duration-100 active:scale-90"
                      style={{
                        width: 12,
                        height: 12,
                        background: color,
                        outline: today ? '2px solid #7d5700' : isSelected ? '2px solid #e5a623' : 'none',
                        outlineOffset: '1px',
                        opacity: cell.inYear ? 1 : 0,
                        cursor: cell.inYear ? 'pointer' : 'default',
                      }}
                      aria-label={cell.inYear ? `${format(cell.date, 'MMM d')}: ${hasEntry ? `mood ${day.moodLevel}` : 'no entry'}` : ''}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && selectedDateObj && (
        <div className="rounded-[20px] bg-[#f9f3e3] border border-[rgba(229,166,35,0.2)] p-5 flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#7d5700]">
              {format(selectedDateObj, 'EEEE, MMMM d, yyyy')}
            </p>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-[#b5a08a] hover:text-[#7d5700] text-[18px] leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {selectedDay ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[28px]">{MOOD_EMOJIS[selectedDay.moodLevel] ?? '😐'}</span>
                <div>
                  <p className="text-[15px] font-semibold text-[#1d1c12]">
                    Mood level {selectedDay.moodLevel}/5
                  </p>
                  {selectedDay.emotionTags.length > 0 && (
                    <p className="text-[12px] text-[#504534]">{selectedDay.emotionTags.join(', ')}</p>
                  )}
                </div>
              </div>

              {selectedDay.activityTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedDay.activityTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-[rgba(229,166,35,0.12)] text-[#7d5700] text-[11px] rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedDay.note && (
                <p className="text-[13px] text-[#504534] leading-[1.6] italic line-clamp-3">
                  &ldquo;{selectedDay.note}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-[#b5a08a]">No mood logged on this day.</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center">
        {[
          { color: PIXEL_COLORS.green, label: 'Joyful / Calm' },
          { color: PIXEL_COLORS.gold, label: 'Energetic' },
          { color: PIXEL_COLORS.gray, label: 'Neutral / Tired' },
          { color: PIXEL_COLORS.pink, label: 'Anxious / Overwhelmed' },
          { color: PIXEL_COLORS.empty, label: 'No entry' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm" style={{ background: color }} />
            <span className="text-[11px] text-[#b5a08a]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
