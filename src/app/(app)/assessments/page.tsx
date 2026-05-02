import { Suspense } from 'react'
import Link from 'next/link'
import { ClipboardList, Brain, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getAllAssessmentHistory, getLastAssessmentTime } from './actions'
import { formatDistanceToNow, differenceInHours } from 'date-fns'

function severityColor(label: string): string {
  switch (label) {
    case 'Minimal': return 'bg-[#22C55E]/10 text-[#16a34a] border-[#22C55E]/30'
    case 'Mild': return 'bg-[#84CC16]/10 text-[#65a30d] border-[#84CC16]/30'
    case 'Moderate': return 'bg-[#EAB308]/10 text-[#ca8a04] border-[#EAB308]/30'
    case 'Moderately Severe': return 'bg-[#F97316]/10 text-[#ea580c] border-[#F97316]/30'
    case 'Severe': return 'bg-[#EF4444]/10 text-[#dc2626] border-[#EF4444]/30'
    default: return 'bg-[#b5a08a]/10 text-[#7d5700] border-[#b5a08a]/30'
  }
}

async function AssessmentCards() {
  const [phq9LastTime, gad7LastTime, history] = await Promise.all([
    getLastAssessmentTime('PHQ9'),
    getLastAssessmentTime('GAD7'),
    getAllAssessmentHistory(),
  ])

  const now = new Date()

  const phq9CooldownHours = phq9LastTime
    ? Math.max(0, 24 - differenceInHours(now, phq9LastTime))
    : 0
  const gad7CooldownHours = gad7LastTime
    ? Math.max(0, 24 - differenceInHours(now, gad7LastTime))
    : 0

  return (
    <>
      {/* Assessment cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* PHQ-9 */}
        <div className="bg-[#f9f3e3] rounded-2xl p-5 border border-[#e8dcc8] shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="size-10 rounded-xl bg-[#EAB308]/15 flex items-center justify-center shrink-0">
              <Brain className="size-5 text-[#ca8a04]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#7d5700] text-[15px] leading-tight">PHQ-9</h3>
              <p className="text-[#9e8a6a] text-[13px] mt-0.5">Depression Screening</p>
            </div>
          </div>
          <p className="text-[#504534] text-[13px] leading-relaxed mb-4">
            The Patient Health Questionnaire assesses the severity of depression symptoms over the past 2 weeks.
          </p>
          <div className="flex items-center gap-3 text-[12px] text-[#9e8a6a] mb-4">
            <span className="flex items-center gap-1">
              <ClipboardList className="size-3.5" />
              9 questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              ~5 min
            </span>
          </div>
          {phq9CooldownHours > 0 ? (
            <div className="w-full py-3 px-4 rounded-xl bg-[#f0e9d9] border border-[#e8dcc8] text-[#9e8a6a] text-[13px] text-center">
              Available in {phq9CooldownHours}h
            </div>
          ) : (
            <Link
              href="/assessments/phq9"
              className="block w-full py-3 px-4 rounded-xl bg-[#7d5700] text-white text-[14px] font-semibold text-center hover:bg-[#6b4a00] transition-colors min-h-[44px] flex items-center justify-center"
            >
              Start Assessment
            </Link>
          )}
        </div>

        {/* GAD-7 */}
        <div className="bg-[#f9f3e3] rounded-2xl p-5 border border-[#e8dcc8] shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="size-10 rounded-xl bg-[#e5a623]/15 flex items-center justify-center shrink-0">
              <Brain className="size-5 text-[#b5820a]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#7d5700] text-[15px] leading-tight">GAD-7</h3>
              <p className="text-[#9e8a6a] text-[13px] mt-0.5">Anxiety Screening</p>
            </div>
          </div>
          <p className="text-[#504534] text-[13px] leading-relaxed mb-4">
            The Generalized Anxiety Disorder scale measures anxiety severity and identifies potential anxiety disorders.
          </p>
          <div className="flex items-center gap-3 text-[12px] text-[#9e8a6a] mb-4">
            <span className="flex items-center gap-1">
              <ClipboardList className="size-3.5" />
              7 questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              ~5 min
            </span>
          </div>
          {gad7CooldownHours > 0 ? (
            <div className="w-full py-3 px-4 rounded-xl bg-[#f0e9d9] border border-[#e8dcc8] text-[#9e8a6a] text-[13px] text-center">
              Available in {gad7CooldownHours}h
            </div>
          ) : (
            <Link
              href="/assessments/gad7"
              className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#e5a623] to-[#c88d1a] text-white text-[14px] font-semibold text-center hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center"
            >
              Start Assessment
            </Link>
          )}
        </div>
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div>
          <h2 className="text-[16px] font-semibold text-[#7d5700] mb-3">Recent Results</h2>
          <div className="space-y-2">
            {history.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-4 bg-[#f9f3e3] rounded-xl border border-[#e8dcc8]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-medium text-[#504534]">
                      {a.type === 'PHQ9' ? 'PHQ-9' : 'GAD-7'}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${severityColor(a.severityLabel)}`}
                    >
                      {a.severityLabel}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#9e8a6a]">
                    Score: {a.score} ·{' '}
                    {a.takenAt
                      ? formatDistanceToNow(new Date(a.takenAt), { addSuffix: true })
                      : 'Unknown'}
                  </p>
                </div>
                <div className="text-[24px] font-bold text-[#7d5700]">{a.score}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-[#f0e9d9] rounded-xl border border-[#e8dcc8]">
        <p className="text-[12px] text-[#9e8a6a] leading-relaxed text-center">
          These are standard screening tools, not clinical diagnoses. Results should be discussed with a qualified healthcare professional.
        </p>
      </div>
    </>
  )
}

function AssessmentCardsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}

export default function AssessmentsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-[#7d5700] tracking-tight mb-1">
            Clinical Assessments
          </h1>
          <p className="text-[#9e8a6a] text-[14px]">
            Validated mental health screening tools to understand your wellbeing
          </p>
        </div>

        <Suspense fallback={<AssessmentCardsSkeleton />}>
          <AssessmentCards />
        </Suspense>
      </div>
    </div>
  )
}
