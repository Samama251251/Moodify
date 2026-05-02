'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  PlusCircle,
  BarChart3,
  Sparkles,
  ClipboardList,
  Download,
  Settings,
  LogOut,
  Wrench,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { logout } from '@/app/(auth)/actions'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/log-mood', label: 'Log Mood', icon: PlusCircle },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/suggestions', label: 'Suggestions', icon: Sparkles },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()

  const fullName =
    user.user_metadata?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'You'

  const initials = (
    user.user_metadata?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('') ??
    user.email?.[0] ??
    'U'
  ).toUpperCase().slice(0, 2)

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 bg-[#f9f3e3] shadow-[4px_0px_24px_rgba(125,87,0,0.04)] min-h-[100dvh] sticky top-0">
      {/* Brand */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-[24px] font-bold text-[#7d5700] tracking-[-1px] leading-[32px]">
          Moodify
        </h1>
        <p className="text-[11px] font-medium text-[#775a00] opacity-60 tracking-[1.2px] uppercase leading-[16px] mt-0.5">
          Your Digital<br />Sanctuary
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-4 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 rounded-full text-[14px] font-medium tracking-[-0.35px] transition-all duration-150 min-h-[44px] ${
                isActive
                  ? 'bg-[#e5a623] text-white shadow-[0px_8px_16px_rgba(229,166,35,0.25)]'
                  : 'text-[#775a00] hover:bg-[#f9f3e3] hover:bg-opacity-80'
              }`}
            >
              <item.icon
                className={`size-[18px] shrink-0 ${
                  isActive ? 'text-white' : 'text-[#775a00]'
                }`}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — user + sign out */}
      <div className="px-4 py-6 border-t border-[rgba(213,196,174,0.3)]">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-[#e5a623]/20 text-[#7d5700] text-[12px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[14px] font-medium text-[#504534] truncate flex-1">
            {fullName}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center justify-center size-8 rounded-full hover:bg-[#f9f3e3] transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4 text-[#827562]" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
