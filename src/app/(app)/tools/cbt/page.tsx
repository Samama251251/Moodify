import { Brain } from 'lucide-react'
import { CBTWizard } from './cbt-wizard'

export default function CBTToolsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      {/* Page header */}
      <div className="mb-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-2xl bg-[#f9f3e3] flex items-center justify-center shrink-0">
            <Brain className="size-5 text-[#7d5700]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#7d5700] tracking-tight leading-tight">
              CBT Thought Record
            </h1>
          </div>
        </div>
        <p className="text-[#504534] text-base leading-relaxed">
          Cognitive Behavioral Therapy helps you identify and challenge unhelpful thinking patterns.
          Work through this structured exercise to gain a more balanced perspective.
        </p>
      </div>

      <CBTWizard />
    </div>
  )
}
