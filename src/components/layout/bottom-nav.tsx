'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home,
  BarChart3,
  Plus,
  Sparkles,
  MoreHorizontal,
  Wrench,
  ClipboardList,
  Download,
  Settings,
  X,
} from 'lucide-react'
import { mp } from '@/lib/mixpanel'

const primaryNav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/log-mood', label: 'Log', icon: Plus, center: true },
  { href: '/suggestions', label: 'Suggest', icon: Sparkles },
]

const moreNav = [
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreActive = moreNav.some((item) => pathname.startsWith(item.href))

  return (
    <>
      {/* More drawer overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer sheet — slides up from bottom */}
      <div
        className={`fixed left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-out ${
          moreOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-3 mb-2 rounded-[24px] bg-[#fff9e9]/98 backdrop-blur-xl border border-[#f0e4c8] shadow-[0px_-8px_32px_rgba(125,87,0,0.12)] overflow-hidden">
          {/* Handle */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-[13px] font-semibold text-[#7d5700] tracking-wide uppercase">
              More
            </span>
            <button
              onClick={() => setMoreOpen(false)}
              className="flex items-center justify-center size-8 rounded-full bg-[#f0e4c8] text-[#7d5700] min-h-[44px] min-w-[44px]"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 px-3 pb-4">
            {moreNav.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    mp.track('bottom_nav_more_item_tapped', { route: item.href })
                    setMoreOpen(false)
                  }}
                  className={`flex flex-col items-center gap-2 py-3 px-2 rounded-[16px] transition-all active:scale-95 min-h-[72px] justify-center ${
                    isActive
                      ? 'bg-[#e5a623]/15 text-[#7d5700]'
                      : 'text-[#b5a08a] hover:bg-[#f0e4c8]/60'
                  }`}
                >
                  <item.icon
                    className={`size-[22px] ${isActive ? 'stroke-[2.5px] text-[#7d5700]' : 'stroke-[1.8px]'}`}
                  />
                  <span className={`text-[10px] font-semibold tracking-wide text-center leading-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#fff9e9]/95 backdrop-blur-md border-t border-[#f0e4c8] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {primaryNav.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            if (item.center) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => mp.track('bottom_nav_log_tapped')}
                  className="flex items-center justify-center -mt-5 size-14 rounded-full bg-gradient-to-br from-[#7d5700] to-[#e5a623] shadow-[0px_6px_16px_rgba(125,87,0,0.3)] active:scale-95 transition-transform"
                >
                  <Plus className="size-6 text-white" strokeWidth={2.5} />
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => mp.track('bottom_nav_tapped', { route: item.href })}
                className={`flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 transition-colors ${
                  isActive ? 'text-[#7d5700]' : 'text-[#b5a08a]'
                }`}
              >
                <item.icon className={`size-[22px] ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => {
              mp.track('bottom_nav_more_tapped')
              setMoreOpen((v) => !v)
            }}
            className={`flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 transition-colors ${
              isMoreActive ? 'text-[#7d5700]' : 'text-[#b5a08a]'
            }`}
            aria-label="More navigation options"
          >
            <MoreHorizontal
              className={`size-[22px] ${isMoreActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`}
            />
            <span className={`text-[10px] font-semibold tracking-wide ${isMoreActive ? 'opacity-100' : 'opacity-70'}`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
