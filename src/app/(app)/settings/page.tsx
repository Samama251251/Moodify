import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { getProfile, getNotificationSettings } from './actions'
import { SettingsClient } from '@/components/settings/settings-client'

async function SettingsData() {
  const [profile, notifSettings] = await Promise.all([
    getProfile(),
    getNotificationSettings(),
  ])

  return (
    <SettingsClient
      initialName={profile?.fullName ?? ''}
      initialEmail={profile?.email ?? ''}
      initialNotifEnabled={notifSettings?.isEnabled ?? false}
      initialScheduledTime={notifSettings?.scheduledTime ?? '20:00'}
    />
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64 rounded-xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px]">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-[#7d5700] tracking-tight mb-1">
            Settings
          </h1>
          <p className="text-[#9e8a6a] text-[14px]">
            Manage your account and preferences
          </p>
        </div>

        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsData />
        </Suspense>
      </div>
    </div>
  )
}
