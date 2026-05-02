import mixpanel from 'mixpanel-browser'

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? ''

let initialized = false

export function initMixpanel() {
  if (typeof window === 'undefined' || initialized || !MIXPANEL_TOKEN) return
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV !== 'production',
    track_pageview: true,
    persistence: 'localStorage',
  })
  initialized = true
}

function safe<T>(fn: () => T): T | undefined {
  if (typeof window === 'undefined' || !initialized) return undefined
  return fn()
}

export const mp = {
  track(event: string, props?: Record<string, unknown>) {
    safe(() => mixpanel.track(event, props))
  },

  identify(userId: string) {
    safe(() => mixpanel.identify(userId))
  },

  people: {
    set(props: Record<string, unknown>) {
      safe(() => mixpanel.people.set(props))
    },
    setOnce(props: Record<string, unknown>) {
      safe(() => mixpanel.people.set_once(props))
    },
  },

  register(props: Record<string, unknown>) {
    safe(() => mixpanel.register(props))
  },

  reset() {
    safe(() => mixpanel.reset())
  },
}
