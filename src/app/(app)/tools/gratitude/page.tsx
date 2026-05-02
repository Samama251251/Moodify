import { getRecentGratitudeLogs } from './actions'
import { GratitudeForm } from './gratitude-form'

export default async function GratitudePage() {
  const recentLogs = await getRecentGratitudeLogs()

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      <div className="max-w-2xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#7d5700] tracking-tight leading-tight">
            Gratitude Journal
          </h1>
          <p className="text-[#504534] mt-2 text-base leading-relaxed">
            Taking a moment each day to reflect on what you&apos;re grateful for shifts your focus
            toward the positive and builds resilience over time.
          </p>
        </div>

        <GratitudeForm recentLogs={recentLogs} />
      </div>
    </div>
  )
}
