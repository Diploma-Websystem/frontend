import { useState } from 'react'
import { Clock, Globe, Loader2, MapPin, Server } from 'lucide-react'
import axios from 'axios'
import { api } from '../../services/api'

interface IpAnalyzeResult {
  success?: boolean
  ip?: string
  country?: string
  city?: string
  region?: string
  isp?: string
  timezone?: string
  latitude?: number
  longitude?: number
  message?: string
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? fallback
  }

  return fallback
}

const IpAnalyzerPage = () => {
  const [ip, setIp] = useState('')
  const [result, setResult] = useState<IpAnalyzeResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const params = ip.trim() ? { ip: ip.trim() } : undefined
      const { data } = await api.get<IpAnalyzeResult>('/api/utilities/ip', { params })

      if (data.success === false) {
        setResult(null)
        setErrorMessage(data.message ?? 'IP analysis failed.')
      } else {
        setResult(data)
      }
    } catch (error) {
      setResult(null)
      setErrorMessage(getApiErrorMessage(error, 'Unable to analyze IP address.'))
    } finally {
      setIsLoading(false)
    }
  }

  const locationLabel = [result?.city, result?.region, result?.country]
    .filter(Boolean)
    .join(', ')

  return (
    <section className="min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">IP Address Analyzer</h1>
          <p className="text-lg text-gray-400">
            Get geolocation and provider details for any IPv4/IPv6.
          </p>
        </header>

        <form
          onSubmit={handleAnalyze}
          className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={ip}
              onChange={(event) => setIp(event.target.value)}
              placeholder="Enter IP (leave empty to analyze your current IP)"
              className="min-w-0 flex-1 rounded-xl border border-gray-800 bg-gray-950 px-5 py-4 text-white placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Analyze
            </button>
          </div>
        </form>

        {errorMessage ? (
          <p className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        {result ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <p className="mb-2 text-sm text-gray-400">IP Address</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <Globe className="h-5 w-5 text-indigo-400" />
                {result.ip ?? 'Unknown'}
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <p className="mb-2 text-sm text-gray-400">Location</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <MapPin className="h-5 w-5 text-purple-400" />
                {locationLabel || 'Unknown'}
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <p className="mb-2 text-sm text-gray-400">Provider</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <Server className="h-5 w-5 text-blue-400" />
                {result.isp ?? 'Unknown'}
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <p className="mb-2 text-sm text-gray-400">Timezone</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <Clock className="h-5 w-5 text-emerald-400" />
                {result.timezone ?? 'Unknown'}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default IpAnalyzerPage

