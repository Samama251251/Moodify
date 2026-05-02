'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, CheckCircle, Heart } from 'lucide-react'
import { mp } from '@/lib/mixpanel'
import { saveGratitudeLog } from './actions'
import type { GratitudeLog } from './actions'
import { format } from 'date-fns'

interface GratitudeFormProps {
  recentLogs: GratitudeLog[]
}

export function GratitudeForm({ recentLogs: initialLogs }: GratitudeFormProps) {
  const [items, setItems] = useState<string[]>(['', '', ''])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [logs, setLogs] = useState<GratitudeLog[]>(initialLogs)

  const updateItem = (index: number, value: string) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = value.slice(0, 500)
      return next
    })
  }

  const addItem = () => {
    if (items.length < 10) {
      setItems((prev) => [...prev, ''])
    }
  }

  const removeItem = (index: number) => {
    if (items.length > 3) {
      setItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const filledCount = items.filter((i) => i.trim().length >= 3).length
  const canSave = filledCount >= 3

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await saveGratitudeLog(items)
      if (result.success) {
        mp.track('gratitude_logged', { item_count: filledCount })
        setSaved(true)
        // Reset after a moment
        setTimeout(() => {
          setSaved(false)
          setItems(['', '', ''])
          // Add to local logs display
          setLogs((prev) => [
            {
              id: Date.now().toString(),
              items: items.filter((i) => i.trim().length >= 3),
              loggedAt: new Date(),
            },
            ...prev.slice(0, 6),
          ])
        }, 2000)
      } else {
        setError(result.error ?? 'Something went wrong')
      }
    })
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="size-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="size-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#7d5700]">Gratitude Logged!</h2>
        <p className="text-[#504534] text-base">Your gratitude has been saved.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Form */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0px_8px_24px_rgba(125,87,0,0.08)] mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-2xl bg-[#fff3d6] flex items-center justify-center shrink-0">
            <Heart className="size-5 text-[#e5a623] fill-[#e5a623]/30" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1d1c12]">What are you grateful for today?</h2>
            <p className="text-sm text-[#b5a08a]">Add at least 3 things (min 3 characters each)</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#f9f3e3] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#7d5700]">{index + 1}</span>
              </div>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={
                  index === 0
                    ? 'I am grateful for...'
                    : index === 1
                    ? 'Something that made me smile...'
                    : index === 2
                    ? 'A person I appreciate...'
                    : 'Another thing I\'m grateful for...'
                }
                maxLength={500}
                className="flex-1 bg-[#f9f3e3] rounded-xl px-4 py-3 text-base text-[#504534] placeholder:text-[#b5a08a] focus:outline-none focus:ring-2 focus:ring-[#e5a623]/40 border border-transparent focus:border-[#e5a623]/30 transition-all min-h-[44px]"
              />
              {items.length > 3 && (
                <button
                  onClick={() => removeItem(index)}
                  className="size-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] text-[#b5a08a] hover:text-red-400"
                  aria-label="Remove item"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {items.length < 10 && (
          <button
            onClick={addItem}
            className="flex items-center gap-2 text-[#7d5700] text-sm font-medium hover:text-[#e5a623] transition-colors mb-5 min-h-[44px]"
          >
            <Plus className="size-4" />
            Add another item
          </button>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-[#b5a08a]">
            {filledCount < 3 ? (
              <span>{3 - filledCount} more needed</span>
            ) : (
              <span className="text-[#4CAF82] font-medium">Ready to save!</span>
            )}
          </p>
          <button
            onClick={handleSave}
            disabled={!canSave || isPending}
            className="bg-gradient-to-r from-[#7d5700] to-[#e5a623] text-white font-bold px-6 py-3 rounded-full shadow-[0px_6px_16px_rgba(125,87,0,0.25)] active:scale-95 transition-transform min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isPending ? 'Saving...' : 'Save Gratitude'}
          </button>
        </div>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#7d5700] mb-4">Recent Entries</h2>
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-[20px] p-5 shadow-[0px_4px_16px_rgba(125,87,0,0.06)]"
              >
                <p className="text-xs font-semibold text-[#b5a08a] uppercase tracking-wide mb-3">
                  {log.loggedAt
                    ? format(new Date(log.loggedAt), 'EEEE, MMMM d')
                    : 'Recently'}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {log.items.slice(0, 4).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#e5a623] mt-0.5 text-sm">•</span>
                      <span className="text-[#504534] text-sm">{item}</span>
                    </li>
                  ))}
                  {log.items.length > 4 && (
                    <li className="text-xs text-[#b5a08a] ml-4">
                      +{log.items.length - 4} more
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-center py-10 bg-[#f9f3e3] rounded-2xl">
          <Heart className="size-10 text-[#e5a623] mx-auto mb-3 opacity-40" />
          <p className="text-[#b5a08a] text-sm font-medium">Your gratitude history will appear here</p>
        </div>
      )}
    </div>
  )
}
