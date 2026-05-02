import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { HeaderBar } from '@/components/layout/header-bar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const fullName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'there'

  return (
    <div className="min-h-[100dvh] bg-[#fff9e9] lg:flex">
      <Sidebar user={user} />

      <div className="flex flex-1 flex-col min-h-[100dvh] lg:min-h-0">
        <HeaderBar user={user} fullName={fullName} />

        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
