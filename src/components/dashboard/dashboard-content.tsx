'use client'

import { QuickMoodCard } from './quick-mood-card'
import { MoodTrendsCard } from './mood-trends-card'
import { BreathingCard } from './breathing-card'
import { InsightsCard } from './insights-card'

interface DashboardContentProps {
  greeting: string
  greetingIcon: string
  fullName: string
}

export function DashboardContent({
  greeting,
  greetingIcon,
  fullName,
}: DashboardContentProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      {/* Greeting */}
      <div className="mb-8 lg:mb-10">
        <h2 className="text-[28px] sm:text-[36px] lg:text-[48px] xl:text-[56px] font-bold text-[#1d1c12] tracking-[-1px] lg:tracking-[-1.5px] leading-[1.2]">
          {greeting}, {fullName}{' '}
          <span className="inline-block">{greetingIcon}</span>
        </h2>
        <p className="text-[14px] sm:text-[16px] lg:text-[18px] text-[#504534] mt-2 lg:mt-3 max-w-[560px]">
          Take a deep breath. Here is your daily sanctuary to reflect and reset.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Row 1: Mood entry + Meditation */}
        <QuickMoodCard />
        <BreathingCard />

        {/* Row 2: Mood chart — full width */}
        <div className="lg:col-span-2">
          <MoodTrendsCard />
        </div>

        {/* Row 3: Insights — full width */}
        <div className="lg:col-span-2">
          <InsightsCard />
        </div>
      </div>
    </div>
  )
}
