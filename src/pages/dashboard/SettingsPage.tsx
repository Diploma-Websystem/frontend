import { useEffect, useMemo, useState } from 'react'
import { KeyRound, Loader2, LogOut, Save, Shield, UserRound } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { api, removeAccessToken } from '../../services/api'

interface AuthMeResponse {
  id?: string
  email?: string
  userName?: string
  hasPassword?: boolean
  externalProviders?: string[]
}

interface ChangePasswordFormState {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string; errors?: string[] }
      | undefined

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join(' ')
    }

    return data?.message ?? data?.error ?? fallback
  }

  return fallback
}

const SettingsPage = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AuthMeResponse | null>(null)
  const [form, setForm] = useState<ChangePasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true)
      try {
        const { data } = await api.get<AuthMeResponse>('/auth/me')
        setProfile(data)
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, 'Unable to load user settings.'))
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [])

  const hasPassword = profile?.hasPassword === true
  const providers = profile?.externalProviders ?? []
  const isExternalOnlyAccount = useMemo(
    () => !hasPassword && providers.length > 0,
    [hasPassword, providers.length],
  )

  const handleInput = (field: keyof ChangePasswordFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!hasPassword) {
      setErrorMessage('Password change is unavailable for external-login accounts.')
      return
    }

    if (!form.currentPassword || !form.newPassword || !form.confirmNewPassword) {
      setErrorMessage('Please fill in all password fields.')
      return
    }

    if (form.newPassword.length < 6) {
      setErrorMessage('New password must contain at least 6 characters.')
      return
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setErrorMessage('Password confirmation does not match.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await api.post('/auth/change-password', form)
      setSuccessMessage('Password updated successfully.')
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to change password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // local cleanup below is sufficient
    } finally {
      removeAccessToken()
      navigate('/login', { replace: true })
    }
  }

  if (isLoadingProfile) {
    return (
      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </section>
    )
  }

  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Settings</h1>
          <p className="text-gray-400">Manage your profile and account security.</p>
        </header>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <UserRound className="h-5 w-5 text-indigo-400" />
            Profile
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-gray-950 px-4 py-3">
              <dt className="text-gray-400">Username</dt>
              <dd className="font-medium text-white">{profile?.userName ?? 'Unknown'}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-950 px-4 py-3">
              <dt className="text-gray-400">Email</dt>
              <dd className="font-medium text-white">{profile?.email ?? 'Unknown'}</dd>
            </div>
            {providers.length > 0 ? (
              <div className="flex items-center justify-between rounded-lg bg-gray-950 px-4 py-3">
                <dt className="text-gray-400">External Providers</dt>
                <dd className="font-medium text-white">{providers.join(', ')}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Shield className="h-5 w-5 text-indigo-400" />
            Security
          </h2>

          {isExternalOnlyAccount ? (
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Your account uses external authentication ({providers.join(', ')}). Password
              change is not available.
            </p>
          ) : null}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Current password</span>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(event) => handleInput('currentPassword', event.target.value)}
                disabled={!hasPassword}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">New password</span>
              <input
                type="password"
                value={form.newPassword}
                onChange={(event) => handleInput('newPassword', event.target.value)}
                disabled={!hasPassword}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Confirm new password</span>
              <input
                type="password"
                value={form.confirmNewPassword}
                onChange={(event) => handleInput('confirmNewPassword', event.target.value)}
                disabled={!hasPassword}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-4 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!hasPassword || isSubmitting}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Saving...' : 'Change password'}
          </button>

          <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <KeyRound className="h-4 w-4" />
            Password changes are available only for local password accounts.
          </p>
        </form>

        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Session</h2>
          <p className="mb-4 text-sm text-gray-300">
            Sign out from your current account on this device.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition-colors hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </section>
  )
}

export default SettingsPage

