'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, BookOpen, Moon } from 'lucide-react'

const tips = [
  {
    id: 1,
    icon: BookOpen,
    iconBg: 'rgba(254,210,101,0.3)',
    iconColor: '#7d5700',
    title: 'Evening Reflection',
    description: 'Writing down three things you were grateful for today can improve your sleep quality by 15%.',
    action: 'Start Activity',
    href: '/suggestions',
    accentColor: '#7d5700',
  },
  {
    id: 2,
    icon: Moon,
    iconBg: 'rgba(146,187,161,0.3)',
    iconColor: '#406650',
    title: 'Wind Down Routine',
    description: 'Your data shows you sleep better when you avoid screens 30 minutes before bed.',
    action: 'Set Reminder',
    href: '/settings',
    accentColor: '#406650',
  },
]

export function InsightsCard() {
  return (
    <div className="rounded-[28px] bg-white shadow-[0px_20px_20px_rgba(125,87,0,0.06)] p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5 lg:mb-6">
        <div className="flex items-center justify-center size-7">
          <Sparkles className="size-5 text-[#e5a623]" strokeWidth={1.5} />
        </div>
        <h3 className="text-[20px] lg:text-[26px] font-semibold text-[#1d1c12] tracking-[-0.5px]">
          Insights for You
        </h3>
      </div>

      {/* Tip cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="flex flex-col gap-3 bg-[#fff9e9] rounded-[20px] p-5 hover:shadow-[0px_8px_20px_rgba(125,87,0,0.06)] transition-shadow duration-200"
          >
            {/* Icon */}
            <div
              className="flex items-center justify-center size-12 rounded-full shrink-0"
              style={{ background: tip.iconBg }}
            >
              <tip.icon className="size-5" style={{ color: tip.iconColor }} strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h4 className="text-[16px] font-bold text-[#1d1c12] leading-[1.3]">
              {tip.title}
            </h4>

            {/* Description */}
            <p className="text-[13px] text-[#504534] leading-[1.6] flex-1">
              {tip.description}
            </p>

            {/* Action link */}
            <Link
              href={tip.href}
              className="inline-flex items-center gap-1 text-[13px] font-semibold min-h-[44px] hover:gap-2 transition-all duration-150"
              style={{ color: tip.accentColor }}
            >
              {tip.action}
              <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
