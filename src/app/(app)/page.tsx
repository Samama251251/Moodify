import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

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

  return <DashboardContent greeting={greeting} greetingIcon={greetingIcon} fullName={fullName} />
}
