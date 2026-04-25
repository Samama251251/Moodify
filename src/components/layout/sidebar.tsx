'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  PlusCircle,
  BarChart3,
  Sparkles,
  ClipboardList,
  Download,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/log-mood', label: 'Log Mood', icon: PlusCircle },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/suggestions', label: 'Suggestions', icon: Sparkles },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:w-[280px] xl:w-[320px] flex-col bg-[#fff8e1] border-r border-[#ebd7b9]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#ebd7b9]">
        <Image
          src="/images/moodify-logo.png"
          alt="Moodify"
          width={35}
          height={33}
        />
        <span
          className="text-[24px] text-[#524439] font-bold"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Moodify
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 px-4 py-6">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-[#ffe082] text-[#524439]'
                  : 'text-[#8d6e63] hover:bg-[#ffe082]/30'
              }`}
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              <item.icon
                className={`size-5 ${
                  isActive ? 'text-[#d7973c]' : 'text-[#c29e75]'
                }`}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
