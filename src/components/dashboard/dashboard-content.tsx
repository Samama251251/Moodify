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
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      {/* Greeting */}
      <h2
        className="text-[22px] sm:text-[26px] text-[#524439] font-bold mb-6 lg:mb-8"
      >
        {greeting}, {fullName} <span>{greetingIcon}</span>
      </h2>

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        <QuickMoodCard />
        <BreathingCard />
        <MoodTrendsCard />
        <InsightsCard />
      </div>
    </div>
  )
}
