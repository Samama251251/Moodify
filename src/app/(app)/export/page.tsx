import { ExportClient } from '@/components/export/export-client'

export default function ExportPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-[#7d5700] tracking-tight mb-1">
            Export Your Data
          </h1>
          <p className="text-[#9e8a6a] text-[14px]">
            Download your mood history and wellness data
          </p>
        </div>

        <ExportClient />
      </div>
    </div>
  )
}
