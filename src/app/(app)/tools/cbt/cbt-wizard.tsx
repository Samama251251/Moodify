'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle, Brain, Lightbulb } from 'lucide-react'
import { mp } from '@/lib/mixpanel'

interface CBTRecord {
  situation: string
  automaticThought: string
  emotion: string
  emotionIntensity: number
  evidenceFor: string
  evidenceAgainst: string
  reframe: string
}

const EMPTY_RECORD: CBTRecord = {
  situation: '',
  automaticThought: '',
  emotion: '',
  emotionIntensity: 5,
  evidenceFor: '',
  evidenceAgainst: '',
  reframe: '',
}

const STEPS = [
  {
    id: 'situation',
    title: 'Situation',
    subtitle: 'What happened?',
    description: 'Describe the situation or event that triggered your difficult thoughts or feelings.',
    placeholder: 'e.g. I was in a meeting and made a mistake while presenting...',
    icon: '📍',
  },
  {
    id: 'automaticThought',
    title: 'Automatic Thought',
    subtitle: 'What went through your mind?',
    description: 'What was the first thought that came to you? Capture it as it was, without filtering.',
    placeholder: 'e.g. Everyone thinks I\'m incompetent...',
    icon: '💭',
  },
  {
    id: 'emotions',
    title: 'Emotions',
    subtitle: 'What did you feel?',
    description: 'Name the emotion and rate its intensity. Being specific helps you understand your patterns.',
    placeholder: 'e.g. Shame, Anxiety, Embarrassment...',
    icon: '❤️',
  },
  {
    id: 'challenge',
    title: 'Challenge',
    subtitle: 'Examine the evidence',
    description: 'Look at this thought objectively. What evidence supports it, and what contradicts it?',
    placeholder: '',
    icon: '⚖️',
  },
  {
    id: 'reframe',
    title: 'Reframe',
    subtitle: 'A more balanced thought',
    description: 'Based on all the evidence, what is a more realistic, balanced way to see this situation?',
    placeholder: 'e.g. I made one mistake, but I\'ve also done many things well. Everyone makes mistakes sometimes...',
    icon: '🌱',
  },
]

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full h-1.5 bg-[#e8e2d3] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#7d5700] to-[#e5a623]"
        initial={{ width: '0%' }}
        animate={{ width: `${((current + 1) / total) * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}

export function CBTWizard() {
  const [step, setStep] = useState(0)
  const [record, setRecord] = useState<CBTRecord>(EMPTY_RECORD)
  const [completed, setCompleted] = useState(false)
  const [savedRecords, setSavedRecords] = useState<CBTRecord[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('moodify_cbt_records')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const currentStepData = STEPS[step]

  const canProceed = () => {
    switch (step) {
      case 0: return record.situation.trim().length >= 5
      case 1: return record.automaticThought.trim().length >= 5
      case 2: return record.emotion.trim().length >= 2
      case 3: return record.evidenceFor.trim().length >= 3 || record.evidenceAgainst.trim().length >= 3
      case 4: return record.reframe.trim().length >= 5
      default: return false
    }
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleComplete = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('moodify_cbt_records') ?? '[]')
      const updated = [{ ...record, completedAt: new Date().toISOString() }, ...existing].slice(0, 10)
      localStorage.setItem('moodify_cbt_records', JSON.stringify(updated))
      setSavedRecords(updated)
    } catch {
      // localStorage unavailable
    }
    mp.track('cbt_completed')
    setCompleted(true)
  }

  const handleStartNew = () => {
    setRecord(EMPTY_RECORD)
    setStep(0)
    setCompleted(false)
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[28px] p-8 shadow-[0px_8px_24px_rgba(125,87,0,0.08)] max-w-2xl"
      >
        <div className="flex flex-col items-center text-center py-6">
          <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="size-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#7d5700] mb-2">Thought Record Complete</h2>
          <p className="text-[#504534] text-base leading-relaxed max-w-sm mb-8">
            Well done. Examining your thoughts like this builds a powerful habit of cognitive flexibility.
          </p>

          {/* Summary */}
          <div className="w-full text-left bg-[#f9f3e3] rounded-2xl p-5 mb-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#b5a08a] uppercase tracking-wide">Situation</p>
              <p className="text-[#504534] text-sm mt-1">{record.situation}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#b5a08a] uppercase tracking-wide">Original thought</p>
              <p className="text-[#504534] text-sm mt-1 italic">&ldquo;{record.automaticThought}&rdquo;</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#4CAF82] uppercase tracking-wide">Balanced thought</p>
              <p className="text-[#504534] text-sm mt-1 font-medium">{record.reframe}</p>
            </div>
          </div>

          <button
            onClick={handleStartNew}
            className="bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white font-bold px-8 py-3.5 rounded-full shadow-[0px_6px_16px_rgba(125,87,0,0.25)] active:scale-95 transition-transform min-h-[44px]"
          >
            Start New Record
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#7d5700]">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-[#b5a08a]">
            {STEPS.map((s, i) => (
              <span
                key={i}
                className={`inline-block size-1.5 rounded-full mx-0.5 transition-all ${
                  i < step
                    ? 'bg-[#e5a623]'
                    : i === step
                    ? 'bg-[#7d5700] scale-150'
                    : 'bg-[#e8e2d3]'
                }`}
              />
            ))}
          </span>
        </div>
        <ProgressBar current={step} total={STEPS.length} />
      </div>

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-[28px] p-6 sm:p-8 shadow-[0px_8px_24px_rgba(125,87,0,0.08)]"
        >
          <div className="flex items-start gap-3 mb-6">
            <span className="text-3xl leading-none">{currentStepData.icon}</span>
            <div>
              <p className="text-xs font-semibold text-[#b5a08a] uppercase tracking-wider">
                {currentStepData.title}
              </p>
              <h2 className="text-xl font-bold text-[#1d1c12] mt-0.5">
                {currentStepData.subtitle}
              </h2>
              <p className="text-[#504534] text-sm mt-1.5 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Step-specific inputs */}
          {step === 0 && (
            <textarea
              value={record.situation}
              onChange={(e) => setRecord((r) => ({ ...r, situation: e.target.value }))}
              placeholder={currentStepData.placeholder}
              rows={4}
              className="w-full bg-[#f9f3e3] rounded-xl px-4 py-3 text-base text-[#504534] placeholder:text-[#b5a08a] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/40 resize-none border border-transparent focus:border-[#e5a623]/30 transition-all"
            />
          )}

          {step === 1 && (
            <textarea
              value={record.automaticThought}
              onChange={(e) => setRecord((r) => ({ ...r, automaticThought: e.target.value }))}
              placeholder={currentStepData.placeholder}
              rows={4}
              className="w-full bg-[#f9f3e3] rounded-xl px-4 py-3 text-base text-[#504534] placeholder:text-[#b5a08a] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/40 resize-none border border-transparent focus:border-[#e5a623]/30 transition-all"
            />
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[#7d5700] mb-2 block">
                  Emotion name
                </label>
                <input
                  type="text"
                  value={record.emotion}
                  onChange={(e) => setRecord((r) => ({ ...r, emotion: e.target.value }))}
                  placeholder={currentStepData.placeholder}
                  className="w-full bg-[#f9f3e3] rounded-xl px-4 py-3 text-base text-[#504534] placeholder:text-[#b5a08a] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/40 border border-transparent focus:border-[#e5a623]/30 transition-all min-h-[44px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#7d5700] mb-2 block">
                  Intensity: <span className="text-[#e5a623] font-bold">{record.emotionIntensity}/10</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={record.emotionIntensity}
                  onChange={(e) => setRecord((r) => ({ ...r, emotionIntensity: Number(e.target.value) }))}
                  className="w-full accent-[#e5a623] h-2"
                />
                <div className="flex justify-between text-xs text-[#b5a08a] mt-1">
                  <span>Mild</span>
                  <span>Intense</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[#7d5700] mb-2 block">
                  Evidence <span className="text-green-600">supporting</span> this thought
                </label>
                <textarea
                  value={record.evidenceFor}
                  onChange={(e) => setRecord((r) => ({ ...r, evidenceFor: e.target.value }))}
                  placeholder="What facts support this thought?"
                  rows={3}
                  className="w-full bg-[#f9f3e3] rounded-xl px-4 py-3 text-base text-[#504534] placeholder:text-[#b5a08a] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/40 resize-none border border-transparent focus:border-[#e5a623]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#7d5700] mb-2 block">
                  Evidence <span className="text-blue-600">against</span> this thought
                </label>
                <textarea
                  value={record.evidenceAgainst}
                  onChange={(e) => setRecord((r) => ({ ...r, evidenceAgainst: e.target.value }))}
                  placeholder="What facts contradict this thought?"
                  rows={3}
                  className="w-full bg-[#f9f3e3] rounded-xl px-4 py-3 text-base text-[#504534] placeholder:text-[#b5a08a] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/40 resize-none border border-transparent focus:border-[#e5a623]/30 transition-all"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-start gap-2 mb-3 bg-[#f9f3e3] rounded-xl p-3">
                <Lightbulb className="size-4 text-[#e5a623] shrink-0 mt-0.5" />
                <p className="text-xs text-[#504534] leading-relaxed">
                  A balanced thought acknowledges both the difficulty and your ability to cope.
                  It doesn&apos;t have to be positive — just more realistic.
                </p>
              </div>
              <textarea
                value={record.reframe}
                onChange={(e) => setRecord((r) => ({ ...r, reframe: e.target.value }))}
                placeholder={currentStepData.placeholder}
                rows={4}
                className="w-full bg-[#f9f3e3] rounded-xl px-4 py-3 text-base text-[#504534] placeholder:text-[#b5a08a] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/40 resize-none border border-transparent focus:border-[#e5a623]/30 transition-all"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#f9f3e3] text-[#7d5700] font-semibold text-sm disabled:opacity-30 hover:bg-[#e8e2d3] transition-colors min-h-[44px]"
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white font-bold text-sm disabled:opacity-30 shadow-[0px_6px_16px_rgba(125,87,0,0.2)] active:scale-95 transition-transform min-h-[44px]"
        >
          {step === STEPS.length - 1 ? 'Complete' : 'Next'}
          {step < STEPS.length - 1 && <ChevronRight className="size-4" />}
          {step === STEPS.length - 1 && <CheckCircle className="size-4" />}
        </button>
      </div>
    </div>
  )
}
