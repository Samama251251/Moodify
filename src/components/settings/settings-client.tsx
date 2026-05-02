'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Bell, Trash2, CheckCircle2, Loader2, Download, AlertTriangle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { updateDisplayName, updateNotificationSettings, deleteAccount } from '@/app/(app)/settings/actions'
import { mp } from '@/lib/mixpanel'

interface Props {
  initialName: string
  initialEmail: string
  initialNotifEnabled: boolean
  initialScheduledTime: string
}

export function SettingsClient({
  initialName,
  initialEmail,
  initialNotifEnabled,
  initialScheduledTime,
}: Props) {
  // Account state
  const [name, setName] = useState(initialName)
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  // Notifications state
  const [notifEnabled, setNotifEnabled] = useState(initialNotifEnabled)
  const [scheduledTime, setScheduledTime] = useState(initialScheduledTime || '20:00')
  const [savingNotif, setSavingNotif] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)
  const [notifError, setNotifError] = useState<string | null>(null)

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const initials = (name || initialEmail)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSaveName = async () => {
    setSavingName(true)
    setNameError(null)
    const result = await updateDisplayName(name)
    setSavingName(false)
    if (result.success) {
      setNameSaved(true)
      mp.track('account_settings_updated')
      setTimeout(() => setNameSaved(false), 2000)
    } else {
      setNameError(result.error ?? 'Failed to save')
    }
  }

  const handleSaveNotifications = async () => {
    setSavingNotif(true)
    setNotifError(null)
    const result = await updateNotificationSettings(notifEnabled, scheduledTime)
    setSavingNotif(false)
    if (result.success) {
      setNotifSaved(true)
      mp.track('notification_settings_updated', { enabled: notifEnabled })
      setTimeout(() => setNotifSaved(false), 2000)
    } else {
      setNotifError(result.error ?? 'Failed to save')
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteAccount()
    setDeleting(false)
    if (!result?.success) {
      setDeleteError(result?.error ?? 'Failed to delete account')
    }
  }

  return (
    <Tabs defaultValue="account">
      <TabsList className="mb-6 bg-[#f9f3e3] border border-[#e8dcc8] rounded-xl p-1 h-auto">
        <TabsTrigger
          value="account"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium text-[#9e8a6a] data-[state=active]:bg-[#7d5700] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
        >
          <User className="size-4" />
          Account
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium text-[#9e8a6a] data-[state=active]:bg-[#7d5700] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
        >
          <Bell className="size-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger
          value="data"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium text-[#9e8a6a] data-[state=active]:bg-[#7d5700] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
        >
          <Trash2 className="size-4" />
          Data
        </TabsTrigger>
      </TabsList>

      {/* Account Tab */}
      <TabsContent value="account">
        <div className="space-y-4">
          <div className="bg-[#f9f3e3] rounded-2xl p-6 border border-[#e8dcc8]">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-16 rounded-2xl bg-[#e5a623]/20 flex items-center justify-center text-[24px] font-bold text-[#7d5700]">
                {initials || '?'}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-[#7d5700]">{name || 'Your Name'}</p>
                <p className="text-[13px] text-[#9e8a6a]">{initialEmail}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="display-name" className="text-[13px] font-medium text-[#504534] mb-1.5 block">
                  Display Name
                </Label>
                <Input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="text-base bg-white border-[#e8dcc8] text-[#504534] placeholder:text-[#b5a08a] focus:border-[#e5a623] focus:ring-[#e5a623]/20"
                />
              </div>

              <div>
                <Label className="text-[13px] font-medium text-[#504534] mb-1.5 block">
                  Email
                </Label>
                <Input
                  value={initialEmail}
                  disabled
                  className="text-base bg-[#f0e9d9] border-[#e8dcc8] text-[#9e8a6a]"
                />
              </div>

              {nameError && (
                <p className="text-[13px] text-[#dc2626]">{nameError}</p>
              )}

              <button
                onClick={handleSaveName}
                disabled={savingName || !name.trim()}
                className="w-full py-3 rounded-xl bg-[#7d5700] text-white text-[14px] font-semibold hover:bg-[#6b4a00] transition-colors min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingName ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : nameSaved ? (
                  <>
                    <CheckCircle2 className="size-4 text-[#22C55E]" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Notifications Tab */}
      <TabsContent value="notifications">
        <div className="space-y-4">
          <div className="bg-[#f9f3e3] rounded-2xl p-6 border border-[#e8dcc8]">
            <h2 className="text-[16px] font-semibold text-[#7d5700] mb-4">Daily Reminders</h2>

            <div className="flex items-center justify-between py-3 border-b border-[#e8dcc8] mb-4">
              <div>
                <p className="text-[14px] font-medium text-[#504534]">Enable daily reminder</p>
                <p className="text-[12px] text-[#9e8a6a] mt-0.5">Get notified to log your mood each day</p>
              </div>
              <Switch
                checked={notifEnabled}
                onCheckedChange={setNotifEnabled}
                className="data-[state=checked]:bg-[#7d5700]"
              />
            </div>

            {notifEnabled && (
              <div className="mb-4">
                <Label htmlFor="reminder-time" className="text-[13px] font-medium text-[#504534] mb-1.5 block">
                  Reminder Time
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="text-base bg-white border-[#e8dcc8] text-[#504534] focus:border-[#e5a623] focus:ring-[#e5a623]/20"
                />
              </div>
            )}

            {notifError && (
              <p className="text-[13px] text-[#dc2626] mb-3">{notifError}</p>
            )}

            <button
              onClick={handleSaveNotifications}
              disabled={savingNotif}
              className="w-full py-3 rounded-xl bg-[#7d5700] text-white text-[14px] font-semibold hover:bg-[#6b4a00] transition-colors min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {savingNotif ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : notifSaved ? (
                <>
                  <CheckCircle2 className="size-4 text-[#22C55E]" />
                  Saved!
                </>
              ) : (
                'Save Notifications'
              )}
            </button>
          </div>

          {/* iOS notice */}
          <div className="bg-[#f9f3e3] rounded-2xl p-4 border border-[#e8dcc8]">
            <p className="text-[12px] text-[#9e8a6a] leading-relaxed">
              <strong className="text-[#7d5700]">Notifications work best</strong> when Moodify is installed to your home screen.
            </p>
            <p className="text-[12px] text-[#9e8a6a] leading-relaxed mt-2">
              <strong className="text-[#7d5700]">On iOS:</strong> Add Moodify to your Home Screen from the Share menu (Safari) to enable notifications.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* Data Tab */}
      <TabsContent value="data">
        <div className="space-y-4">
          {/* Export link */}
          <Link
            href="/export"
            className="flex items-center gap-4 p-5 bg-[#f9f3e3] rounded-2xl border border-[#e8dcc8] hover:bg-[#f0e9d9] transition-colors"
          >
            <div className="size-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
              <Download className="size-5 text-[#16a34a]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#7d5700]">Export Your Data</p>
              <p className="text-[13px] text-[#9e8a6a]">Download PDF report or CSV data</p>
            </div>
          </Link>

          {/* Delete account */}
          <div className="bg-[#FEF2F2] rounded-2xl p-6 border border-[#EF4444]/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="size-10 rounded-xl bg-[#EF4444]/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5 text-[#dc2626]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#dc2626]">Delete My Account & All Data</h3>
                <p className="text-[13px] text-[#7f1d1d] mt-1 leading-relaxed">
                  This will permanently delete all your mood entries, assessments, and account data. This cannot be undone.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full py-3 rounded-xl bg-[#EF4444] text-white text-[14px] font-semibold hover:bg-[#dc2626] transition-colors min-h-[44px]"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </TabsContent>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white border-[#e8dcc8] rounded-2xl mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-[#dc2626] flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-[#504534] leading-relaxed">
              This will permanently delete all your mood entries, assessments, and account data. <strong>This cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Label className="text-[13px] font-medium text-[#504534] mb-2 block">
              Type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="text-base border-[#e8dcc8] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
            />
            {deleteError && (
              <p className="text-[13px] text-[#dc2626] mt-2">{deleteError}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmText('')
              }}
              className="flex-1 py-2.5 rounded-xl border border-[#e8dcc8] text-[#7d5700] text-[14px] font-medium hover:bg-[#f0e9d9] transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || deleting}
              className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-[14px] font-semibold hover:bg-[#dc2626] transition-colors min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Forever'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
