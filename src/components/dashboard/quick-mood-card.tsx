'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const moods = [
  { level: 5, label: 'Great', emoji: '😄', bg: 'rgba(255,211,108,0.4)', border: 'rgba(247,180,50,0.5)', textColor: '#524439' },
  { level: 4, label: 'Good', emoji: '🙂', bg: 'rgba(248,222,178,0.6)', border: 'transparent', textColor: '#66584d' },
  { level: 3, label: 'Neutral', emoji: '😐', bg: 'rgba(248,222,178,0.6)', border: 'transparent', textColor: '#66584d' },
  { level: 2, label: 'Bad', emoji: '😕', bg: 'rgba(242,169,142,0.4)', border: 'transparent', textColor: '#964d36' },
  { level: 1, label: 'Awful', emoji: '😞', bg: 'rgba(232,140,140,0.4)', border: 'transparent', textColor: '#8b3a3a' },
]

export function QuickMoodCard() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!selectedMood) return
    setSaving(true)
    // TODO: wire up to server action
    setTimeout(() => {
      setSaving(false)
      setSelectedMood(null)
      setNote('')
    }, 1000)
  }

  return (
    <div className="bg-white/70 backdrop-blur-[5px] border border-white/50 rounded-2xl p-5 sm:p-6 shadow-[0px_8px_12.5px_rgba(255,193,7,0.15)]">
      <h3
        className="text-[18px] text-[#524439] font-semibold mb-4"
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        How are you feeling today?
      </h3>

      {/* Mood emoji buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
        {moods.map((mood) => (
          <button
            key={mood.level}
            onClick={() => setSelectedMood(mood.level)}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-[14px] font-normal transition-all duration-150 min-h-[44px] ${
              selectedMood === mood.level
                ? 'ring-2 ring-[#f7b432] scale-[1.02]'
                : ''
            }`}
            style={{
              fontFamily: 'var(--font-nunito)',
              backgroundColor: mood.bg,
              border: `1px solid ${mood.border}`,
              color: mood.textColor,
            }}
          >
            <span className="text-[20px]">{mood.emoji}</span>
            {mood.label}
          </button>
        ))}
      </div>

      {/* Note input */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        placeholder="Add a note..."
        className="w-full bg-[rgba(248,222,178,0.4)] border border-[#d7ad72] rounded-xl px-4 py-3 text-base text-[#524439] placeholder:text-[#9ca3af] font-medium resize-none h-[50px] focus:outline-none focus:ring-1 focus:ring-[#d7ad72]"
        style={{ fontFamily: 'var(--font-nunito)' }}
      />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!selectedMood || saving}
        className="w-full mt-3 h-12 rounded-xl bg-gradient-to-b from-[#ffd36c] to-[#f7b432] text-white text-[16px] font-extrabold tracking-[0.4px] shadow-[0px_4px_5px_rgba(247,180,50,0.3)] hover:shadow-[0px_6px_12px_rgba(247,180,50,0.4)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 min-h-[44px]"
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        {saving ? 'Saving...' : 'Save Mood'}
      </button>
    </div>
  )
}

export function QuickMoodCardSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-[5px] border border-white/50 rounded-2xl p-5 sm:p-6 shadow-[0px_8px_12.5px_rgba(255,193,7,0.15)]">
      <Skeleton className="h-7 w-56 mb-4" />
      <div className="flex gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl mb-3" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}
