import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { getDashboardData } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fullName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const greetingIcon = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'

  const data = await getDashboardData()

  return (
    <DashboardContent
      greeting={greeting}
      greetingIcon={greetingIcon}
      fullName={fullName}
      todayEntries={data.todayEntries}
      weeklyData={data.weeklyData}
      currentStreak={data.currentStreak}
      longestStreak={data.longestStreak}
      totalEntries={data.totalEntries}
      recentBadges={data.recentBadges}
    />
  )
}
