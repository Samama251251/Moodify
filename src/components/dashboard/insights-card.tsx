'use client'

import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

export function InsightsCard() {
  return (
    <div
      className="border border-[#fbe6c6] rounded-2xl shadow-[0px_8px_30px_rgba(215,165,100,0.12)] overflow-hidden relative min-h-[240px]"
      style={{
        background:
          'linear-gradient(152deg, rgb(254, 242, 218) 0%, rgb(252, 234, 187) 100%)',
      }}
    >
      {/* Illustration on the right (desktop), hidden on smaller screens */}
      <div className="absolute right-0 bottom-0 opacity-90 hidden sm:block">
        <Image
          src="/images/insights-illustration.webp"
          alt=""
          width={280}
          height={186}
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full min-h-[240px]">
        <h3
          className="text-[18px] text-[#524439] font-semibold mb-3"
        >
          Insights for You
        </h3>

        <p
          className="text-[14px] text-[#755a41] font-normal leading-[20px] max-w-[200px] mb-4"
        >
          Log at least 5 mood entries to get personalized AI suggestions.
        </p>

        <div className="flex flex-wrap gap-2">
          <span
            className="px-4 py-2 bg-[#fdf2dd] border border-white/50 rounded-xl text-[11px] text-[#755a41] font-normal shadow-[0px_2px_15px_#f6d5b0] min-h-[38px] flex items-center"
          >
            Journaling
          </span>
          <span
            className="px-4 py-2 bg-[#fdf2dd] border border-white/50 rounded-xl text-[11px] text-[#755a41] font-normal shadow-[0px_2px_15px_#f6d5b0] min-h-[38px] flex items-center"
          >
            Sleep Tips
          </span>
        </div>
      </div>
    </div>
  )
}

export function InsightsCardSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-[5px] border border-white/50 rounded-2xl p-5 sm:p-6 shadow-[0px_8px_12.5px_rgba(255,193,7,0.15)] min-h-[240px]">
      <Skeleton className="h-7 w-40 mb-3" />
      <Skeleton className="h-20 w-48 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  )
}
