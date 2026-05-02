'use client'

import { useEffect } from 'react'
import { initMixpanel, mp } from '@/lib/mixpanel'
import { createClient } from '@/lib/supabase/client'

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initMixpanel()

    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        mp.identify(user.id)
        mp.people.set({
          $email: user.email,
          $name: user.user_metadata?.full_name ?? user.email?.split('@')[0],
        })
        mp.register({ platform: 'web' })
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user
        mp.identify(user.id)
        mp.people.set({
          $email: user.email,
          $name: user.user_metadata?.full_name ?? user.email?.split('@')[0],
        })
        mp.register({ platform: 'web' })
        mp.track('session_started', {
          sign_in_method: user.app_metadata?.provider ?? 'email',
        })
      }

      if (event === 'SIGNED_OUT') {
        mp.reset()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <>{children}</>
}
