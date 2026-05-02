'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { saveMoodEntry } from '@/app/(app)/log-mood/actions'
import { mp } from '@/lib/mixpanel'

// ─── Data ─────────────────────────────────────────────────────────────────────

const MOODS = [
  { level: 1, emoji: '😞', label: 'Awful',   color: '#EF4444', lightBg: 'rgba(239,68,68,0.08)'  },
  { level: 2, emoji: '😕', label: 'Bad',     color: '#F97316', lightBg: 'rgba(249,115,22,0.08)' },
  { level: 3, emoji: '😐', label: 'Neutral', color: '#EAB308', lightBg: 'rgba(234,179,8,0.08)'  },
  { level: 4, emoji: '🙂', label: 'Good',    color: '#84CC16', lightBg: 'rgba(132,204,22,0.08)' },
  { level: 5, emoji: '😄', label: 'Great',   color: '#22C55E', lightBg: 'rgba(34,197,94,0.08)'  },
] as const

const EMOTIONS = [
  'Joyful', 'Calm', 'Anxious', 'Sad', 'Angry', 'Tired',
  'Energetic', 'Overwhelmed', 'Grateful', 'Focused', 'Lonely', 'Hopeful',
  'Content', 'Stressed',
]

const ACTIVITIES = [
  { label: 'Work',       icon: '💼' },
  { label: 'Exercise',   icon: '🏃' },
  { label: 'Social',     icon: '👥' },
  { label: 'Sleep',      icon: '😴' },
  { label: 'Food',       icon: '🍎' },
  { label: 'Nature',     icon: '🌿' },
  { label: 'Meditation', icon: '🧘' },
  { label: 'Reading',    icon: '📚' },
  { label: 'Music',      icon: '🎵' },
  { label: 'Family',     icon: '🏠' },
]

const STEPS = ['Mood', 'Emotions', 'Activities', 'Notes'] as const

// ─── Animation ────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '45%' : '-45%', opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit:  (dir: number) => ({ x: dir < 0 ? '45%' : '-45%', opacity: 0, scale: 0.97 }),
}

const springTransition = { type: 'spring', stiffness: 380, damping: 40 } as const

// ─── Main component ───────────────────────────────────────────────────────────

export function LogMoodFlow() {
  const router = useRouter()
  const [step, setStep]             = useState(0)
  const [dir, setDir]               = useState(1)
  const [moodLevel, setMoodLevel]   = useState<number | null>(null)
  const [emotions, setEmotions]     = useState<string[]>([])
  const [activities, setActivities] = useState<string[]>([])
  const [note, setNote]             = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const selectedMood = MOODS.find((m) => m.level === moodLevel)
  const accentColor  = selectedMood?.color ?? '#e5a623'

  const go = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const toggleEmotion  = (e: string) =>
    setEmotions((p)    => p.includes(e) ? p.filter((x) => x !== e) : [...p, e])
  const toggleActivity = (a: string) =>
    setActivities((p)  => p.includes(a) ? p.filter((x) => x !== a) : [...p, a])

  const handleSave = async () => {
    if (!moodLevel) return
    setSaving(true)
    setError(null)

    const result = await saveMoodEntry({ moodLevel, emotions, activities, note: note.trim() })

    if (result.success) {
      mp.track('mood_logged', {
        level: moodLevel,
        label: selectedMood?.label,
        has_note: note.trim().length > 0,
        emotion_tags: emotions,
        activity_tags: activities,
      })
      setSaved(true)
      setTimeout(() => router.push('/'), 1800)
    } else {
      setError(result.error ?? 'Something went wrong.')
      setSaving(false)
    }
  }

  const canProceed = step === 0 ? moodLevel !== null : true

  return (
    <div className="flex flex-col items-center min-h-full px-4 sm:px-6 py-6 lg:py-10">

      {/* ── Page heading ── */}
      <div className="w-full max-w-2xl mb-6 lg:mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[28px] sm:text-[36px] lg:text-[40px] font-bold text-[#7d5700] tracking-[-1px] leading-tight"
        >
          How are you feeling?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="text-[14px] sm:text-[16px] text-[#504534] mt-1"
        >
          Take a moment to reflect on your day.
        </motion.p>
      </div>

      {/* ── Stepper ── */}
      <div className="w-full max-w-2xl mb-7 lg:mb-9">
        <div className="flex items-start">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <motion.div
                  animate={{
                    backgroundColor:
                      i < step  ? '#e5a623' :
                      i === step ? accentColor :
                      'white',
                    boxShadow:
                      i === step
                        ? `0 4px 14px ${accentColor}55`
                        : '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="size-9 sm:size-10 rounded-full flex items-center justify-center text-[12px] sm:text-[13px] font-bold shrink-0"
                  style={{ color: i <= step ? 'white' : '#504534' }}
                >
                  {i < step ? <Check className="size-3.5 sm:size-4" /> : i + 1}
                </motion.div>
                <span
                  className={`text-[8px] sm:text-[9px] font-bold tracking-[0.5px] uppercase whitespace-nowrap transition-colors duration-300 ${
                    i === step ? 'text-[#7d5700]' : i < step ? 'text-[#c4a46e]' : 'text-[#d4c4a8]'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-1 sm:mx-2 h-px mt-[-16px] sm:mt-[-18px] relative overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-[#eee8d8]" />
                  <motion.div
                    className="absolute inset-y-0 left-0 origin-left"
                    animate={{ scaleX: i < step ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    style={{ right: 0, background: '#e5a623' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step card ── */}
      <div className="w-full max-w-2xl overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={springTransition}
            className="bg-[#f9f3e3] rounded-[28px] lg:rounded-[32px] p-6 sm:p-8 shadow-[0px_20px_40px_rgba(125,87,0,0.07)]"
          >
            {step === 0 && (
              <MoodStep
                moodLevel={moodLevel}
                onSelect={setMoodLevel}
                accentColor={accentColor}
              />
            )}
            {step === 1 && (
              <TagStep
                title="Emotions"
                subtitle="How are you feeling inside? Select all that apply."
                tags={EMOTIONS.map((e) => ({ label: e }))}
                selected={emotions}
                onToggle={toggleEmotion}
                accentColor={accentColor}
              />
            )}
            {step === 2 && (
              <TagStep
                title="Activities"
                subtitle="What were you up to? Select all that apply."
                tags={ACTIVITIES}
                selected={activities}
                onToggle={toggleActivity}
                accentColor={accentColor}
              />
            )}
            {step === 3 && (
              <NotesStep
                note={note}
                onChange={setNote}
                moodEmoji={selectedMood?.emoji ?? ''}
                moodLabel={selectedMood?.label ?? ''}
                moodColor={accentColor}
                emotions={emotions}
                activities={activities}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mt-3 text-[13px] text-red-500 text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="w-full max-w-2xl mt-5 flex items-center justify-between gap-3">
        {step > 0 ? (
          <motion.button
            onClick={() => go(step - 1)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-5 py-3 rounded-full text-[14px] font-medium text-[#775a00] hover:bg-[#f0e4c8] active:bg-[#e8d5aa] transition-colors min-h-[44px]"
          >
            <ChevronLeft className="size-4" />
            Back
          </motion.button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {(step === 1 || step === 2) && (
            <button
              onClick={() => go(step + 1)}
              className="px-4 py-3 text-[14px] font-medium text-[#b5a08a] hover:text-[#775a00] transition-colors min-h-[44px]"
            >
              Skip
            </button>
          )}

          {step < 3 ? (
            <motion.button
              onClick={() => go(step + 1)}
              disabled={!canProceed}
              whileTap={{ scale: canProceed ? 0.96 : 1 }}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-white min-h-[44px] transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor})`,
                boxShadow: canProceed ? `0 4px 16px ${accentColor}45` : 'none',
              }}
            >
              Continue
              <ChevronRight className="size-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSave}
              disabled={saving || saved}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-[14px] font-bold text-white min-h-[44px] disabled:opacity-60 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #7d5700, #e5a623)',
                boxShadow: '0 6px 20px rgba(229,166,35,0.35)',
              }}
            >
              {saving ? (
                <><Loader2 className="size-4 animate-spin" /> Saving…</>
              ) : saved ? (
                <><Check className="size-4" /> Saved!</>
              ) : (
                'Save Entry'
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Success toast ── */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-28 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 backdrop-blur-md bg-[rgba(146,187,161,0.35)] border border-[rgba(146,187,161,0.5)] px-6 py-3 rounded-full flex items-center gap-2 shadow-lg whitespace-nowrap"
          >
            <Check className="size-4 text-[#2d6a4f]" />
            <span className="text-[14px] font-medium text-[#2d6a4f]">Entry saved ✨</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Step 1: Mood picker ───────────────────────────────────────────────────────

function MoodStep({
  moodLevel,
  onSelect,
  accentColor,
}: {
  moodLevel: number | null
  onSelect: (level: number) => void
  accentColor: string
}) {
  const hasSelection = moodLevel !== null

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1d1c12] tracking-[-0.5px]">
          Select your mood
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#504534] mt-1 opacity-60">
          How would you describe how you feel right now?
        </p>
      </div>

      <div className="flex items-end justify-center gap-2 sm:gap-4 py-4 sm:py-6">
        {MOODS.map((mood) => {
          const isSelected = moodLevel === mood.level
          const faded = hasSelection && !isSelected

          return (
            <motion.button
              key={mood.level}
              onClick={() => onSelect(mood.level)}
              animate={{
                scale: isSelected ? 1.12 : faded ? 0.9 : 1,
                opacity: faded ? 0.45 : 1,
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="flex flex-col items-center gap-2 focus:outline-none cursor-pointer shrink-0"
              aria-label={`${mood.label} — mood level ${mood.level}`}
            >
              <div
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: isSelected ? 76 : 60,
                  height: isSelected ? 76 : 60,
                  background: isSelected ? mood.lightBg : 'white',
                  boxShadow: isSelected
                    ? `0 0 0 3px ${mood.color}55, 0 8px 24px ${mood.color}25`
                    : '0 2px 12px rgba(125,87,0,0.06)',
                }}
              >
                <span
                  className="leading-none select-none"
                  style={{ fontSize: isSelected ? 34 : 26 }}
                >
                  {mood.emoji}
                </span>
              </div>
              <span
                className="text-[11px] sm:text-[12px] font-semibold transition-colors duration-200 whitespace-nowrap"
                style={{ color: isSelected ? mood.color : '#c4b49a' }}
              >
                {mood.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Mood color accent bar */}
      <AnimatePresence>
        {moodLevel && (
          <motion.div
            key={moodLevel}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="h-1 rounded-full origin-left"
            style={{ background: accentColor }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Step 2 & 3: Generic tag picker ───────────────────────────────────────────

function TagStep({
  title,
  subtitle,
  tags,
  selected,
  onToggle,
  accentColor,
}: {
  title: string
  subtitle: string
  tags: { label: string; icon?: string }[]
  selected: string[]
  onToggle: (label: string) => void
  accentColor: string
}) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1d1c12] tracking-[-0.5px]">
          {title}
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#504534] mt-1 opacity-60">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {tags.map(({ label, icon }) => {
          const isSelected = selected.includes(label)
          return (
            <motion.button
              key={label}
              onClick={() => onToggle(label)}
              whileTap={{ scale: 0.93 }}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium min-h-[44px] transition-all duration-150"
              style={{
                background: isSelected ? accentColor : 'white',
                color: isSelected ? 'white' : '#504534',
                boxShadow: isSelected
                  ? `0 4px 12px ${accentColor}40`
                  : '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              {icon && <span className="text-base leading-none">{icon}</span>}
              {label}
            </motion.button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-[#b5a08a]"
        >
          {selected.length} selected
        </motion.p>
      )}
    </div>
  )
}

// ─── Step 4: Notes ────────────────────────────────────────────────────────────

function NotesStep({
  note,
  onChange,
  moodEmoji,
  moodLabel,
  moodColor,
  emotions,
  activities,
}: {
  note: string
  onChange: (v: string) => void
  moodEmoji: string
  moodLabel: string
  moodColor: string
  emotions: string[]
  activities: string[]
}) {
  const MAX = 500

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Recap pill */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(125,87,0,0.04)]">
        <span className="text-2xl">{moodEmoji}</span>
        <span
          className="text-[13px] font-semibold px-3 py-1 rounded-full"
          style={{ background: moodColor + '18', color: moodColor }}
        >
          {moodLabel}
        </span>
        {emotions.slice(0, 4).map((e) => (
          <span
            key={e}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f0e4c8] text-[#7d5700]"
          >
            {e}
          </span>
        ))}
        {emotions.length > 4 && (
          <span className="text-[11px] text-[#b5a08a]">+{emotions.length - 4}</span>
        )}
        {activities.slice(0, 2).map((a) => {
          const act = ACTIVITIES.find((x) => x.label === a)
          return (
            <span
              key={a}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#eee8d8] text-[#7d5700]"
            >
              {act?.icon} {a}
            </span>
          )
        })}
        {emotions.length === 0 && activities.length === 0 && (
          <span className="text-[12px] text-[#c4b49a] italic">No tags added</span>
        )}
      </div>

      <div>
        <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1d1c12] tracking-[-0.5px]">
          Notes
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#504534] mt-1 opacity-60">
          Anything else you'd like to add? Totally optional.
        </p>
      </div>

      <div className="relative">
        <textarea
          value={note}
          onChange={(e) => onChange(e.target.value)}
          maxLength={MAX}
          placeholder="What's on your mind? How was your day…"
          rows={5}
          className="w-full bg-white rounded-2xl px-5 py-4 text-base text-[#1d1c12] placeholder:text-[#c4b49a] resize-none outline-none shadow-[0_2px_12px_rgba(125,87,0,0.04)] focus:shadow-[0_0_0_2px_rgba(125,87,0,0.18)] transition-shadow leading-relaxed"
        />
        <span
          className={`absolute bottom-3 right-4 text-[11px] pointer-events-none transition-colors ${
            note.length > MAX * 0.88 ? 'text-orange-400' : 'text-[#d4c4a8]'
          }`}
        >
          {note.length}/{MAX}
        </span>
      </div>
    </div>
  )
}
