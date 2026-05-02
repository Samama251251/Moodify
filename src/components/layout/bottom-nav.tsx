'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Plus, Wrench, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/log-mood', label: 'Log', icon: Plus, center: true },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#fff9e9]/95 backdrop-blur-md border-t border-[#f0e4c8] pb-[env(safe-area-inset-bottom)]">
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
      </div>
    </nav>
  )
}
