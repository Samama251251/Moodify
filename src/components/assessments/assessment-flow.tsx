'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, AlertTriangle, CheckCircle2, Phone } from 'lucide-react'
import { saveAssessment, getAssessmentHistory } from '@/app/(app)/assessments/actions'
import { mp } from '@/lib/mixpanel'
import Link from 'next/link'

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or thoughts of hurting yourself in some way',
]

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
]

const ANSWER_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
]

function scorePHQ9(score: number): string {
  if (score <= 4) return 'Minimal'
  if (score <= 9) return 'Mild'
  if (score <= 14) return 'Moderate'
  if (score <= 19) return 'Moderately Severe'
  return 'Severe'
}

function scoreGAD7(score: number): string {
  if (score <= 4) return 'Minimal'
  if (score <= 9) return 'Mild'
  if (score <= 14) return 'Moderate'
  return 'Severe'
}

function severityColor(label: string): string {
  switch (label) {
    case 'Minimal': return '#22C55E'
    case 'Mild': return '#84CC16'
    case 'Moderate': return '#EAB308'
    case 'Moderately Severe': return '#F97316'
    case 'Severe': return '#EF4444'
    default: return '#9e8a6a'
  }
}

function severityBgColor(label: string): string {
  switch (label) {
    case 'Minimal': return 'bg-[#22C55E]/10 border-[#22C55E]/30'
    case 'Mild': return 'bg-[#84CC16]/10 border-[#84CC16]/30'
    case 'Moderate': return 'bg-[#EAB308]/10 border-[#EAB308]/30'
    case 'Moderately Severe': return 'bg-[#F97316]/10 border-[#F97316]/30'
    case 'Severe': return 'bg-[#EF4444]/10 border-[#EF4444]/30'
    default: return 'bg-[#b5a08a]/10 border-[#b5a08a]/30'
  }
}

function getInterpretation(type: 'PHQ9' | 'GAD7', label: string): string {
  if (type === 'PHQ9') {
    switch (label) {
      case 'Minimal': return 'Your responses suggest minimal depressive symptoms. Continue with your wellness routine.'
      case 'Mild': return 'Your responses suggest mild depression. Consider self-care practices and monitoring your mood.'
      case 'Moderate': return 'Your responses suggest moderate depression. Talking to a healthcare provider is recommended.'
      case 'Moderately Severe': return 'Your responses suggest moderately severe depression. Please consult a mental health professional.'
      case 'Severe': return 'Your responses suggest severe depression. Please reach out to a mental health professional as soon as possible.'
      default: return ''
    }
  } else {
    switch (label) {
      case 'Minimal': return 'Your responses suggest minimal anxiety symptoms. Continue with your wellness routine.'
      case 'Mild': return 'Your responses suggest mild anxiety. Breathing exercises and stress management may help.'
      case 'Moderate': return 'Your responses suggest moderate anxiety. Consider speaking with a healthcare provider.'
      case 'Severe': return 'Your responses suggest severe anxiety. Please consult a mental health professional.'
      default: return ''
    }
  }
}

type Step = 'disclaimer' | 'questions' | 'crisis' | 'results'

interface Props {
  type: 'PHQ9' | 'GAD7'
}

export function AssessmentFlow({ type }: Props) {
  const router = useRouter()
  const questions = type === 'PHQ9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS
  const maxScore = type === 'PHQ9' ? 27 : 21

  const [step, setStep] = useState<Step>('disclaimer')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [crisisAcknowledged, setCrisisAcknowledged] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previousScore, setPreviousScore] = useState<number | null>(null)

  const score = answers.reduce((sum, a) => sum + a, 0)
  const severityLabel = type === 'PHQ9' ? scorePHQ9(score) : scoreGAD7(score)

  const needsCrisisResources =
    type === 'PHQ9' && (score >= 20 || (answers[8] !== undefined && answers[8] > 0))

  const handleStart = () => {
    mp.track('assessment_started', { type })
    setStep('questions')
  }

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setAnswers(newAnswers)
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setAnswers(newAnswers)
        const finalScore = newAnswers.reduce((sum, a) => sum + a, 0)
        const finalLabel = type === 'PHQ9' ? scorePHQ9(finalScore) : scoreGAD7(finalScore)
        const crisisNeeded = type === 'PHQ9' && (finalScore >= 20 || newAnswers[8] > 0)

        mp.track('assessment_completed', { type, score: finalScore, severity: finalLabel })

        if (crisisNeeded) {
          setStep('crisis')
        } else {
          setStep('results')
        }

        // Fetch previous score for comparison
        getAssessmentHistory(type).then((history) => {
          if (history.length >= 1) {
            setPreviousScore(history[0].score)
          }
        })
      }
    }, 300)
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else {
      setStep('disclaimer')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await saveAssessment(type, answers, score, severityLabel)
    setSaving(false)
    if (result.success) {
      setSaved(true)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  // Disclaimer step
  if (step === 'disclaimer') {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[640px]">
        <Link
          href="/assessments"
          className="inline-flex items-center gap-2 text-[#9e8a6a] text-[14px] mb-6 hover:text-[#7d5700] transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Assessments
        </Link>

        <div className="bg-[#f9f3e3] rounded-2xl p-6 border border-[#e8dcc8]">
          <div className="size-12 rounded-2xl bg-[#EAB308]/15 flex items-center justify-center mb-4">
            <AlertTriangle className="size-6 text-[#ca8a04]" />
          </div>
          <h1 className="text-[22px] font-bold text-[#7d5700] mb-3">Important Notice</h1>
          <p className="text-[#504534] text-[15px] leading-relaxed mb-4">
            This assessment is a <strong>standard mental health screening tool</strong>. It is <strong>NOT a clinical diagnosis</strong>. Results should be discussed with a qualified healthcare professional.
          </p>
          <p className="text-[#504534] text-[14px] leading-relaxed mb-6 text-[#9e8a6a]">
            This {type === 'PHQ9' ? 'PHQ-9 depression screening' : 'GAD-7 anxiety screening'} contains {questions.length} questions and takes about 5 minutes. Please answer based on how you have felt over the past 2 weeks.
          </p>

          <button
            onClick={handleStart}
            className="w-full py-4 rounded-xl bg-[#7d5700] text-white text-[15px] font-semibold hover:bg-[#6b4a00] transition-colors min-h-[44px]"
          >
            I understand, continue
          </button>

          <Link
            href="/assessments"
            className="block w-full py-3 text-center text-[#9e8a6a] text-[14px] mt-2 hover:text-[#7d5700] transition-colors"
          >
            Go back
          </Link>
        </div>
      </div>
    )
  }

  // Questions step
  if (step === 'questions') {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[640px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="size-10 rounded-full bg-[#f9f3e3] border border-[#e8dcc8] flex items-center justify-center hover:bg-[#f0e9d9] transition-colors min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="size-4 text-[#7d5700]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium text-[#9e8a6a]">
                {type === 'PHQ9' ? 'PHQ-9' : 'GAD-7'} — Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-[13px] font-medium text-[#9e8a6a]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-[#e8dcc8] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: '#e5a623' }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="bg-[#f9f3e3] rounded-2xl p-6 border border-[#e8dcc8] mb-4">
              <p className="text-[12px] font-semibold text-[#9e8a6a] uppercase tracking-wider mb-3">
                Over the past 2 weeks, how often have you been bothered by...
              </p>
              <h2 className="text-[20px] font-bold text-[#7d5700] leading-snug">
                {questions[currentQuestion]}
              </h2>
            </div>

            {/* Answer options */}
            <div className="space-y-3">
              {ANSWER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all min-h-[56px] flex items-center gap-3 ${
                    answers[currentQuestion] === option.value
                      ? 'border-[#e5a623] bg-[#e5a623]/10 text-[#7d5700]'
                      : 'border-[#e8dcc8] bg-[#f9f3e3] text-[#504534] hover:border-[#d4b896] hover:bg-[#f0e9d9]'
                  } active:scale-[0.98]`}
                >
                  <span
                    className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[currentQuestion] === option.value
                        ? 'border-[#e5a623] bg-[#e5a623]'
                        : 'border-[#d4b896]'
                    }`}
                  >
                    {answers[currentQuestion] === option.value && (
                      <span className="size-2.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="text-[15px] font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Crisis resources step (PHQ-9 score >= 20 or Q9 > 0)
  if (step === 'crisis') {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[640px]">
        <div className="bg-[#FEF2F2] rounded-2xl p-6 border-2 border-[#EF4444]/30 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="size-10 rounded-xl bg-[#EF4444]/15 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="size-5 text-[#dc2626]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#dc2626] mb-1">
                If you're in crisis, please reach out immediately
              </h2>
              <p className="text-[#7f1d1d] text-[13px] leading-relaxed">
                Your responses indicate you may be having thoughts of self-harm. Please know that you are not alone and help is available.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <a
              href="tel:03174288665"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#EF4444]/20 hover:bg-[#FEF2F2] transition-colors"
            >
              <div className="size-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center shrink-0">
                <Phone className="size-5 text-[#dc2626]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#dc2626]">Umang Helpline (Pakistan)</p>
                <p className="text-[16px] font-bold text-[#7f1d1d]">0317-4288665</p>
              </div>
            </a>

            <a
              href="tel:05128905"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#EF4444]/20 hover:bg-[#FEF2F2] transition-colors"
            >
              <div className="size-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center shrink-0">
                <Phone className="size-5 text-[#dc2626]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#dc2626]">Rozan Counseling Center</p>
                <p className="text-[16px] font-bold text-[#7f1d1d]">051-2890505</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-[#f9f3e3] rounded-2xl p-6 border border-[#e8dcc8]">
          <h3 className="text-[16px] font-semibold text-[#7d5700] mb-3">Before viewing your results</h3>
          <p className="text-[#504534] text-[14px] leading-relaxed mb-4">
            Please confirm that you have read the crisis resources above and are aware of the support available to you.
          </p>

          <label className="flex items-start gap-3 cursor-pointer group mb-6">
            <div
              className={`size-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                crisisAcknowledged
                  ? 'border-[#7d5700] bg-[#7d5700]'
                  : 'border-[#d4b896] group-hover:border-[#9e8a6a]'
              }`}
              onClick={() => setCrisisAcknowledged(!crisisAcknowledged)}
            >
              {crisisAcknowledged && (
                <CheckCircle2 className="size-4 text-white" />
              )}
            </div>
            <span className="text-[14px] text-[#504534] leading-relaxed select-none"
              onClick={() => setCrisisAcknowledged(!crisisAcknowledged)}>
              I have read the crisis resources above and understand that professional help is available
            </span>
          </label>

          <button
            onClick={() => setStep('results')}
            disabled={!crisisAcknowledged}
            className="w-full py-4 rounded-xl bg-[#7d5700] text-white text-[15px] font-semibold hover:bg-[#6b4a00] transition-colors min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            View My Results
          </button>
        </div>
      </div>
    )
  }

  // Results step
  if (step === 'results') {
    const scorePercentage = (score / maxScore) * 100
    const color = severityColor(severityLabel)
    const bgClass = severityBgColor(severityLabel)

    return (
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[640px]">
        <div className="mb-4">
          <h1 className="text-[22px] font-bold text-[#7d5700] mb-1">Your Results</h1>
          <p className="text-[#9e8a6a] text-[14px]">
            {type === 'PHQ9' ? 'PHQ-9 Depression Screening' : 'GAD-7 Anxiety Screening'}
          </p>
        </div>

        {/* Score display */}
        <div className="bg-[#f9f3e3] rounded-2xl p-6 border border-[#e8dcc8] mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[13px] text-[#9e8a6a] mb-1">Total Score</p>
              <p className="text-[48px] font-bold leading-none" style={{ color }}>
                {score}
              </p>
              <p className="text-[13px] text-[#9e8a6a] mt-1">out of {maxScore}</p>
            </div>
            <div className={`px-4 py-2 rounded-xl border ${bgClass}`}>
              <p className="text-[12px] font-semibold" style={{ color }}>{severityLabel}</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-4">
            <div className="h-3 bg-[#e8dcc8] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${scorePercentage}%`, backgroundColor: color }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-[#9e8a6a]">0</span>
              <span className="text-[11px] text-[#9e8a6a]">{maxScore}</span>
            </div>
          </div>

          {/* Trend */}
          {previousScore !== null && (
            <div className="flex items-center gap-2 mb-4 text-[13px]">
              <span className="text-[#9e8a6a]">vs. last assessment:</span>
              <span
                className={`font-semibold ${
                  score > previousScore
                    ? 'text-[#EF4444]'
                    : score < previousScore
                    ? 'text-[#22C55E]'
                    : 'text-[#9e8a6a]'
                }`}
              >
                {score > previousScore
                  ? `↑ ${score - previousScore} points`
                  : score < previousScore
                  ? `↓ ${previousScore - score} points`
                  : 'No change'}
              </span>
            </div>
          )}

          <p className="text-[14px] text-[#504534] leading-relaxed">
            {getInterpretation(type, severityLabel)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 mb-4">
          {!saved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-xl bg-[#7d5700] text-white text-[15px] font-semibold hover:bg-[#6b4a00] transition-colors min-h-[44px] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Results'}
            </button>
          ) : (
            <div className="flex items-center gap-2 justify-center py-3 bg-[#22C55E]/10 rounded-xl border border-[#22C55E]/30">
              <CheckCircle2 className="size-5 text-[#22C55E]" />
              <span className="text-[14px] font-medium text-[#16a34a]">Results saved</span>
            </div>
          )}

          <Link
            href="/assessments"
            className="block w-full py-3 text-center text-[14px] font-medium text-[#9e8a6a] bg-[#f9f3e3] rounded-xl border border-[#e8dcc8] hover:bg-[#f0e9d9] transition-colors min-h-[44px] flex items-center justify-center"
          >
            View History
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-[#f0e9d9] rounded-xl border border-[#e8dcc8]">
          <p className="text-[12px] text-[#9e8a6a] leading-relaxed text-center">
            This is not a medical record or clinical diagnosis. These results are for informational purposes only. Please discuss with a qualified healthcare professional.
          </p>
        </div>
      </div>
    )
  }

  return null
}
