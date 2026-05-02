import Link from 'next/link'
import { Wind, Heart, Brain, ArrowRight, type LucideIcon } from 'lucide-react'

interface ToolConfig {
  href: string
  icon: LucideIcon
  title: string
  description: string
  duration: string
  color: string
  bgAccent: string
  external: boolean
}

const tools: ToolConfig[] = [
  {
    href: '/breathing',
    icon: Wind,
    title: 'Breathing Exercises',
    description: 'Calm your nervous system with guided breathing. Box, 4-7-8, and simple rhythms.',
    duration: '3–15 min',
    color: 'from-[#e5a623] to-[#f9c74f]',
    bgAccent: 'rgba(255,222,170,0.2)',
    external: true,
  },
  {
    href: '/tools/gratitude',
    icon: Heart,
    title: 'Gratitude Journal',
    description: 'Shift your mindset by reflecting on what you appreciate today.',
    duration: '5 min',
    color: 'from-[#e991a0] to-[#f4b8c2]',
    bgAccent: 'rgba(233,145,160,0.15)',
    external: false,
  },
  {
    href: '/tools/cbt',
    icon: Brain,
    title: 'CBT Thought Record',
    description: 'Challenge unhelpful thinking with a guided 5-step cognitive behavioral exercise.',
    duration: '10–15 min',
    color: 'from-[#4caf82] to-[#7dd8a8]',
    bgAccent: 'rgba(76,175,130,0.15)',
    external: false,
  },
]

function ToolCard({ tool }: { tool: ToolConfig }) {
  const Icon = tool.icon

  const inner = (
    <>
      {/* Corner accent */}
      <div
        className="absolute right-[-32px] top-[-32px] size-[96px] rounded-bl-full"
        style={{ background: `radial-gradient(circle, ${tool.bgAccent} 0%, transparent 100%)` }}
      />

      <div className={`size-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-sm`}>
        <Icon className="size-6 text-white" />
      </div>

      <div className="flex-1">
        <h2 className="text-[#1d1c12] font-bold text-lg leading-tight">{tool.title}</h2>
        <p className="text-[#504534] text-sm leading-relaxed mt-1.5">{tool.description}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#b5a08a] bg-[#f9f3e3] px-3 py-1.5 rounded-full">
          {tool.duration}
        </span>
        <span className="size-8 rounded-full bg-[#f9f3e3] flex items-center justify-center group-hover:bg-[#e5a623] group-hover:text-white transition-colors text-[#7d5700]">
          <ArrowRight className="size-4" />
        </span>
      </div>
    </>
  )

  const className =
    'group bg-white rounded-[24px] p-6 shadow-[0px_8px_24px_rgba(125,87,0,0.08)] flex flex-col gap-4 relative overflow-hidden hover:shadow-[0px_12px_32px_rgba(125,87,0,0.14)] transition-all active:scale-[0.99]'

  if (tool.external) {
    return (
      <a href={tool.href} className={className}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={tool.href} className={className}>
      {inner}
    </Link>
  )
}

export default function ToolsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#7d5700] tracking-tight leading-tight">
          Wellness Tools
        </h1>
        <p className="text-[#504534] mt-2 text-base leading-relaxed">
          Evidence-based exercises to support your mental wellbeing. Use them anytime.
        </p>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl">
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
      </div>
    </div>
  )
}
