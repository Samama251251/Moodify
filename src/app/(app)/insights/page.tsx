import { Suspense } from 'react'
import { getInsightsData } from '../actions'
import { InsightsClient } from '@/components/insights/insights-client'
import { Skeleton } from '@/components/ui/skeleton'

function InsightsSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      <Skeleton className="h-9 w-40 mb-3" />
      <Skeleton className="h-5 w-64 mb-8" />
      <Skeleton className="h-12 w-72 rounded-full mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-[20px]" />)}
      </div>
      <Skeleton className="h-56 rounded-[24px] mb-5" />
      <Skeleton className="h-40 rounded-[24px]" />
    </div>
  )
}

async function InsightsData() {
  const { entries, currentStreak, longestStreak } = await getInsightsData()

  return (
    <InsightsClient
      entries={entries}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
    />
  )
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<InsightsSkeleton />}>
      <InsightsData />
    </Suspense>
  )
}
