'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { mp } from '@/lib/mixpanel'

const moods = [
  { level: 1, emoji: '😢', label: 'Awful' },
  { level: 2, emoji: '😕', label: 'Bad' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '🙂', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Great' },
]

export function QuickMoodCard() {
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    const moodLabel = moods.find((m) => m.level === selected)?.label
    // TODO: wire up server action
    await new Promise((r) => setTimeout(r, 800))
    mp.track('mood_logged', {
      mood_level: selected,
      mood_label: moodLabel,
      has_note: note.length > 0,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setSelected(null)
      setNote('')
    }, 1800)
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-white/80 backdrop-blur-[12px] border border-white/60 shadow-[0px_20px_40px_rgba(125,87,0,0.06)] p-6 lg:p-8 flex flex-col gap-5">
      {/* Decorative glow */}
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[rgba(255,210,100,0.2)] blur-[40px] pointer-events-none" />

      <h3 className="text-[18px] lg:text-[22px] font-semibold text-[#7d5700] leading-[1.3] relative">
        How are you feeling right now?
      </h3>

      {/* Emoji row */}
      <div className="flex items-center justify-between px-1 relative">
        {moods.map((mood) => {
          const isSelected = selected === mood.level
          return (
            <button
              key={mood.level}
              onClick={() => setSelected(mood.level)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-95 min-w-[44px] min-h-[44px] justify-center rounded-2xl py-2 px-1 ${
                isSelected
                  ? 'bg-[#f9f3e3] shadow-[0px_8px_16px_rgba(125,87,0,0.12)] scale-110'
                  : 'opacity-50 hover:opacity-80 hover:scale-105'
              }`}
              aria-label={mood.label}
            >
              <span className={`select-none transition-all duration-200 ${isSelected ? 'text-[44px]' : 'text-[32px]'}`}>
                {mood.emoji}
              </span>
            </button>
          )
        })}
      </div>

      {/* Note field */}
      <div className="relative">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          placeholder="Jot down a quick thought..."
          rows={2}
          className="w-full bg-[#f9f3e3] rounded-[20px] px-5 py-4 text-base text-[#504534] placeholder:text-[rgba(80,69,52,0.4)] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/30 resize-none leading-[1.5]"
        />
        {note.length > 0 && (
          <span className="absolute bottom-3 right-4 text-[11px] text-[rgba(80,69,52,0.4)]">
            {note.length}/500
          </span>
        )}
      </div>

      {/* Save button — full width on mobile, auto on desktop */}
      <button
        onClick={handleSave}
        disabled={!selected || saving}
        className={`w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-[15px] transition-all duration-200 min-h-[52px] sm:min-h-[44px] ${
          saved
            ? 'bg-[#4CAF82] text-white shadow-[0px_8px_16px_rgba(76,175,130,0.25)]'
            : 'bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white shadow-[0px_8px_20px_rgba(125,87,0,0.2)] hover:shadow-[0px_12px_24px_rgba(125,87,0,0.25)] active:scale-[0.98] disabled:opacity-40'
        }`}
      >
        {saved ? 'Saved ✓' : saving ? 'Saving…' : <><span>Save Entry</span><ArrowRight size={14} /></>}
      </button>
    </div>
  )
}
