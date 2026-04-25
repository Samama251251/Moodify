'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Plus, Wrench, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/log-mood', label: 'Log', icon: Plus, center: true },
  { href: '/suggestions', label: 'Tools', icon: Wrench },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-md border-t border-[#ebd7b9] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center -mt-6 size-14 rounded-full bg-gradient-to-b from-[#ffd36c] to-[#f7b432] shadow-[0px_4px_12px_rgba(255,179,0,0.4)] active:scale-95 transition-transform"
              >
                <Plus className="size-7 text-white" strokeWidth={2.5} />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] px-2 ${
                isActive ? 'text-[#d7973c]' : 'text-[#a89c93]'
              }`}
            >
              <item.icon className="size-5" />
              <span
                className="text-[10px] font-semibold"
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
