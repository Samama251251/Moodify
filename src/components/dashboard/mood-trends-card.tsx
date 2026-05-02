'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function MoodTrendsCard() {
  return (
    <div className="bg-white/70 backdrop-blur-[5px] border border-white/50 rounded-2xl p-5 sm:p-6 shadow-[0px_8px_12.5px_rgba(255,193,7,0.15)]">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[18px] text-[#524439] font-semibold"
        >
          Your Mood Trends
        </h3>
      </div>

      <p
        className="text-[13px] text-[#66584d] font-normal mb-4"
      >
        Mood This Week
      </p>

      {/* Empty state — chart skeleton */}
      <div className="h-[168px] flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-[14px] text-[#8d6e63] mb-1"
          >
            No mood data yet
          </p>
          <p
            className="text-[12px] text-[#b5a799]"
          >
            Log at least 3 entries to see trends
          </p>
        </div>
      </div>
    </div>
  )
}

export function MoodTrendsCardSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-[5px] border border-white/50 rounded-2xl p-5 sm:p-6 shadow-[0px_8px_12.5px_rgba(255,193,7,0.15)]">
      <Skeleton className="h-7 w-44 mb-3" />
      <Skeleton className="h-5 w-28 mb-4" />
      <Skeleton className="h-[168px] w-full rounded-lg" />
    </div>
  )
}
