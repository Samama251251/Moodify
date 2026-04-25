import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">
      {/* Left panel — brand + illustration */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-start overflow-hidden">
        <Image
          src="/images/auth-bg-left.webp"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 flex flex-col gap-8 px-16 pt-16">
          <div className="flex items-center gap-3">
            <Image
              src="/images/moodify-logo.png"
              alt="Moodify"
              width={51}
              height={47}
            />
            <h1
              className="text-[40px] leading-[48px] text-[#6d4c41]"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Moodify
            </h1>
          </div>
          <p
            className="text-[24px] leading-[33px] text-[#8d6e63] text-center font-bold max-w-[280px]"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            Track your mood.
            <br />
            Understand yourself.
          </p>
        </div>
      </div>

      {/* Right panel — form area */}
      <div className="relative flex flex-1 items-center justify-center min-h-[100dvh] lg:min-h-0 px-6 py-12">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/images/auth-bg-left.webp"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Desktop right background */}
        <div className="absolute inset-0 hidden lg:block">
          <Image
            src="/images/auth-bg-right.webp"
            alt=""
            fill
            className="object-cover opacity-70"
          />
        </div>
        <div className="relative z-10 w-full max-w-[480px]">{children}</div>
      </div>
    </div>
  )
}
