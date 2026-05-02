'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'

export function BreathingCard() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[rgba(146,187,161,0.3)] shadow-[0px_20px_40px_rgba(125,87,0,0.06)] min-h-[280px] lg:min-h-0 flex flex-col justify-end">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/meditation-illustration.png"
          alt="Meditation"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover opacity-80 mix-blend-multiply"
          priority
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,33,18,0.88)] via-[rgba(0,33,18,0.35)] to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-6 lg:p-8">
        <p className="text-[11px] font-bold text-[#c2edd0] tracking-[1.2px] uppercase mb-2">
          Exercise
        </p>
        <h3 className="text-[26px] lg:text-[30px] font-bold text-white leading-[1.2] mb-5">
          Harmony within you
        </h3>
        <Link
          href="/suggestions"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full backdrop-blur-[6px] bg-white/10 border border-white/20 text-white text-[15px] font-semibold hover:bg-white/20 active:scale-[0.97] transition-all duration-150 min-h-[44px]"
        >
          <Play size={10} className="fill-white" />
          Start 10 min session
        </Link>
      </div>
    </div>
  )
}
