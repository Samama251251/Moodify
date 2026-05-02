import { redirect } from 'next/navigation'
import { getLastAssessmentTime } from '../actions'
import { differenceInHours } from 'date-fns'
import { AssessmentFlow } from '@/components/assessments/assessment-flow'

interface Props {
  params: Promise<{ type: string }>
}

export default async function AssessmentTypePage({ params }: Props) {
  const { type } = await params

  if (type !== 'phq9' && type !== 'gad7') {
    redirect('/assessments')
  }

  const assessmentType = type === 'phq9' ? 'PHQ9' : 'GAD7'
  const lastTime = await getLastAssessmentTime(assessmentType)

  if (lastTime) {
    const hoursAgo = differenceInHours(new Date(), lastTime)
    if (hoursAgo < 24) {
      redirect('/assessments')
    }
  }

  return <AssessmentFlow type={assessmentType} />
}
