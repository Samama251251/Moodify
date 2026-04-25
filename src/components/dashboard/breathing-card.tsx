'use client'

import Image from 'next/image'
import Link from 'next/link'

export function BreathingCard() {
  return (
    <div className="bg-white/70 backdrop-blur-[5px] border border-white/50 rounded-2xl p-5 sm:p-6 shadow-[0px_8px_12.5px_rgba(255,193,7,0.15)]">
      <h3
        className="text-[18px] text-[#524439] font-semibold mb-4"
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        Exercise
      </h3>

      <div className="relative bg-[#d5e6f4] rounded-2xl overflow-hidden h-[170px] sm:h-[190px]">
        <Image
          src="/images/exercise-bg.webp"
          alt="Breathing exercise"
          fill
          className="object-cover rounded-2xl"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-center">
          <p
            className="text-[18px] sm:text-[20px] text-[#524439] font-normal leading-[28px] mb-3"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            Harmony
            <br />
            within you
          </p>
          <Link
            href="/suggestions"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/70 border border-[#d9d9d9] rounded-full text-[13px] text-[#524439] font-semibold hover:bg-white/90 transition-colors min-h-[44px]"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            Start
          </Link>
        </div>
      </div>
    </div>
  )
}
