import { useState } from 'react'
import { Lock, Mail, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GithubLogo, GoogleLogo } from '../../components/ui/SocialLogos'
import { API_BASE_URL, api, extractAccessToken, setAccessToken } from '../../services/api'

interface RegisterFormState {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const EXTERNAL_LOGIN_RETURN_URL =
  typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/dashboard'

const googleExternalLoginHref = `${API_BASE_URL}/auth/external-login?provider=Google&returnUrl=${encodeURIComponent(EXTERNAL_LOGIN_RETURN_URL)}`
const githubExternalLoginHref = `${API_BASE_URL}/auth/external-login?provider=GitHub&returnUrl=${encodeURIComponent(EXTERNAL_LOGIN_RETURN_URL)}`

const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; error?: string; title?: string }
      | undefined

    return (
      responseData?.message ??
      responseData?.error ??
      responseData?.title ??
      'Registration failed. Please try again.'
    )
  }

  return 'Unexpected error occurred. Please try again.'
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterFormState>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof RegisterFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError(null)
  }

  const validate = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      return 'Please fill in all required fields.'
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email)) {
      return 'Please enter a valid email address.'
    }

    if (form.password.length < 6) {
      return 'Password must contain at least 6 characters.'
    }

    if (form.password !== form.confirmPassword) {
      return 'Password and confirmation do not match.'
    }

    if (!agreeToTerms) {
      return 'Please accept Terms of Service and Privacy Policy.'
    }

    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const response = await api.post('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      const accessToken = extractAccessToken(response.data)
      if (accessToken) {
        setAccessToken(accessToken)
        navigate('/dashboard', { replace: true })
        return
      }

      navigate('/login')
    } catch (error) {
      setFormError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 lg:flex lg:w-1/2">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-20 top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-12">
            <div className="mb-6 flex h-24 w-24 rotate-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <div className="h-16 w-16 -rotate-12 rounded-xl bg-white/30" />
            </div>
            <h1 className="mb-4 text-5xl font-bold leading-tight">
              Join thousands of
              <br />
              developers worldwide
            </h1>
            <p className="text-xl text-white/90">
              Start using powerful utilities in seconds
            </p>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-gray-950 px-6 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <header className="mb-8">
            <h2 className="mb-2 text-3xl font-bold text-white">Create an account</h2>
            <p className="text-gray-400">Get started with your free account</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) => handleChange('fullName', event.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 py-3 pl-11 pr-4 text-white placeholder:text-gray-500 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 py-3 pl-11 pr-4 text-white placeholder:text-gray-500 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-300"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 py-3 pl-11 pr-4 text-white placeholder:text-gray-500 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-300"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) => handleChange('confirmPassword', event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 py-3 pl-11 pr-4 text-white placeholder:text-gray-500 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(event) => setAgreeToTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border border-gray-800 bg-gray-900 accent-indigo-500"
              />
              <span className="text-sm text-gray-400">
                I agree to the{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  Privacy Policy
                </a>
              </span>
            </label>

            {formError ? (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-800" />
            <span className="text-sm text-gray-500">or sign up with</span>
            <div className="h-px flex-1 bg-gray-800" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={googleExternalLoginHref}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              <GoogleLogo />
              Google
            </a>
            <a
              href={githubExternalLoginHref}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              <GithubLogo />
              GitHub
            </a>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default RegisterPage

