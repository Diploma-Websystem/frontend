import { useMemo, useState } from 'react'
import { Ban, BarChart3, Check, Copy, ExternalLink, History, Link2, Loader2, Trash2, X } from 'lucide-react'
import axios from 'axios'
import { api } from '../../services/api'

interface ShortenResponse {
  shortCode?: string
  shortUrl?: string
}

interface UrlHistoryItem {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  createdAt: string
  expiresAt?: string | null
  isActive?: boolean
  visitCount?: number
}

type ExpirePreset = '1m' | '1d' | '7d' | '30d'
type StatsPeriod = '7d' | '30d' | '90d' | 'all'
type ToastType = 'success' | 'error'

interface ToastState {
  message: string
  type: ToastType
}

interface ShortLinkStatsResponse {
  totalVisits: number
  visitsInPeriod: number
  series: Array<{ date: string; visits: number }>
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? fallback
  }

  return fallback
}

const UrlShortenerPage = () => {
  const [url, setUrl] = useState('')
  const [expirePreset, setExpirePreset] = useState<ExpirePreset>('1m')
  const [result, setResult] = useState<ShortenResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [history, setHistory] = useState<UrlHistoryItem[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [deactivateDialogId, setDeactivateDialogId] = useState<string | null>(null)
  const [deleteHistoryItemDialogId, setDeleteHistoryItemDialogId] = useState<string | null>(null)
  const [deletingHistoryItemId, setDeletingHistoryItemId] = useState<string | null>(null)
  const [isClearHistoryDialogOpen, setIsClearHistoryDialogOpen] = useState(false)
  const [isClearingHistory, setIsClearingHistory] = useState(false)
  const [statsDialogItem, setStatsDialogItem] = useState<UrlHistoryItem | null>(null)
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('7d')
  const [isStatsLoading, setIsStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [statsData, setStatsData] = useState<ShortLinkStatsResponse | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const expirationPayload = useMemo<{ expireInDays?: number; expireInMinutes?: number }>(() => {
    switch (expirePreset) {
      case '1m':
        return { expireInMinutes: 1 }
      case '1d':
        return { expireInDays: 1 }
      case '7d':
        return { expireInDays: 7 }
      case '30d':
        return { expireInDays: 30 }
      default:
        return { expireInMinutes: 1 }
    }
  }, [expirePreset])

  const validateUrl = (value: string) => {
    try {
      const parsed = new URL(value)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCopied(false)
    setResult(null)

    const normalizedUrl = url.trim()
    if (!normalizedUrl) {
      setErrorMessage('Please enter a URL.')
      return
    }

    if (!validateUrl(normalizedUrl)) {
      setErrorMessage('Please enter a valid absolute URL (http/https).')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { data } = await api.post<ShortenResponse>('/api/utilities/shorten', {
        url: normalizedUrl,
        ...expirationPayload,
      })
      setResult(data)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to shorten URL.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result?.shortUrl) {
      return
    }

    await navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const openHistory = async () => {
    setIsHistoryOpen(true)
    setIsHistoryLoading(true)
    setHistoryError(null)

    try {
      const { data } = await api.get<UrlHistoryItem[]>('/api/utilities/shorten/history')
      setHistory(data)
    } catch (error) {
      setHistoryError(
        getApiErrorMessage(error, 'Failed to load your links history. Please sign in and try again.')
      )
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const reloadHistory = async () => {
    const { data } = await api.get<UrlHistoryItem[]>('/api/utilities/shorten/history')
    setHistory(data)
  }

  const clearHistory = async () => {
    setIsClearingHistory(true)
    setHistoryError(null)

    try {
      await api.delete('/api/utilities/shorten/history')
      setHistory([])
      setIsClearHistoryDialogOpen(false)
      showToast('Link history cleared.', 'success')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to clear link history.')
      setHistoryError(message)
      showToast(message, 'error')
    } finally {
      setIsClearingHistory(false)
    }
  }

  const copyHistoryLink = async (id: string, shortUrl: string) => {
    await navigator.clipboard.writeText(shortUrl)
    setCopiedHistoryId(id)
    setTimeout(() => setCopiedHistoryId(null), 1500)
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const openStatsDialog = async (item: UrlHistoryItem) => {
    setStatsDialogItem(item)
    setStatsPeriod('7d')
    setStatsData(null)
    setStatsError(null)
    setIsStatsLoading(true)

    try {
      const { data } = await api.get<ShortLinkStatsResponse>(`/api/utilities/shorten/${item.id}/stats`, {
        params: { period: '7d' },
      })
      setStatsData(data)
    } catch (error) {
      setStatsError(getApiErrorMessage(error, 'Failed to load link statistics.'))
    } finally {
      setIsStatsLoading(false)
    }
  }

  const loadStatsForPeriod = async (period: StatsPeriod) => {
    if (!statsDialogItem) {
      return
    }

    setStatsPeriod(period)
    setStatsData(null)
    setStatsError(null)
    setIsStatsLoading(true)

    try {
      const { data } = await api.get<ShortLinkStatsResponse>(
        `/api/utilities/shorten/${statsDialogItem.id}/stats`,
        { params: { period } },
      )
      setStatsData(data)
    } catch (error) {
      setStatsError(getApiErrorMessage(error, 'Failed to load link statistics.'))
    } finally {
      setIsStatsLoading(false)
    }
  }

  const deactivateLink = async (id: string) => {
    setDeactivatingId(id)
    setHistoryError(null)

    try {
      await api.post(`/api/utilities/shorten/${id}/deactivate`)
      await reloadHistory()
      showToast('Short link was deactivated.', 'success')
      setDeactivateDialogId(null)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to deactivate the short link.')
      setHistoryError(message)
      showToast(message, 'error')
    } finally {
      setDeactivatingId(null)
    }
  }

  const deleteHistoryItem = async (id: string) => {
    setDeletingHistoryItemId(id)
    setHistoryError(null)

    try {
      await api.delete(`/api/utilities/shorten/history/${id}`)
      await reloadHistory()
      setDeleteHistoryItemDialogId(null)
      showToast('History item deleted.', 'success')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to delete history item.')
      setHistoryError(message)
      showToast(message, 'error')
    } finally {
      setDeletingHistoryItemId(null)
    }
  }

  const isExpired = (item: UrlHistoryItem) => {
    if (item.isActive !== undefined) {
      return !item.isActive
    }

    if (!item.expiresAt) return false
    return new Date(item.expiresAt).getTime() <= Date.now()
  }
  const formatExpirationLabel = (item: UrlHistoryItem) => {
    if (!item.expiresAt) {
      return 'No expiration date'
    }

    const local = new Date(item.expiresAt).toLocaleString()
    return isExpired(item) ? `Inactive since ${local}` : `Expires at ${local}`
  }


  const trimUrl = (value: string, max = 80) => {
    if (value.length <= max) return value
    return `${value.slice(0, max)}...`
  }

  return (
    <section className="flex min-h-[calc(100vh-73px)] items-start justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-3xl">
        <header className="mb-10 flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Shorten your long links</h1>
            <p className="text-lg text-gray-400">Create short, memorable URLs for sharing.</p>
          </div>
          <button
            type="button"
            onClick={openHistory}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800"
          >
            <History className="h-4 w-4" />
            My Link History
          </button>
        </header>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm sm:p-8">
          <form className="mb-8 space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Paste your long URL here..."
                className="min-w-0 flex-1 rounded-xl border border-gray-800 bg-gray-950 px-5 py-4 text-base text-white placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-lg"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Link2 className="h-5 w-5" />
                )}
                {isLoading ? 'Shortening...' : 'Shorten'}
              </button>
            </div>

            <div className="max-w-xs">
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="expiration-select">
                Link lifetime
              </label>
              <select
                id="expiration-select"
                value={expirePreset}
                onChange={(event) => setExpirePreset(event.target.value as ExpirePreset)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1m">1 minute (test mode)</option>
                <option value="1d">24 hours (1 day)</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
              </select>
            </div>
          </form>

          {errorMessage ? (
            <p className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          {result?.shortUrl ? (
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-5">
              <p className="mb-2 text-sm text-gray-300">Your shortened URL</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-0 flex-1 items-center gap-2 break-all rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-indigo-400 hover:text-indigo-300"
                >
                  {result.shortUrl}
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5 text-green-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {isHistoryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-white">My Link History</h2>
                <p className="text-sm text-gray-400">
                  Latest links first. Expired links are marked automatically.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsClearHistoryDialogOpen(true)}
                  disabled={isHistoryLoading || history.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear history
                </button>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="rounded-lg border border-gray-700 bg-gray-950 p-2 text-gray-300 hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-gray-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading history...
                </div>
              ) : historyError ? (
                <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {historyError}
                </p>
              ) : history.length === 0 ? (
                <p className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-8 text-center text-gray-400">
                  У вас ще немає посилань.
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => {
                    const expired = isExpired(item)
                    return (
                      <article
                        key={item.id}
                        className="rounded-xl border border-gray-800 bg-gray-950 p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              expired
                                ? 'border border-red-500/40 bg-red-500/10 text-red-200'
                                : 'border border-green-500/40 bg-green-500/10 text-green-200'
                            }`}
                          >
                            {expired ? 'Expired' : 'Active'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Created: {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p
                          className={`mb-3 text-xs ${
                            expired ? 'text-red-300' : 'text-gray-400'
                          }`}
                        >
                          {formatExpirationLabel(item)}
                        </p>

                        <p className="mb-2 text-sm text-gray-400">Original URL</p>
                        <div className="mb-4 flex items-center gap-2">
                          <a
                            href={item.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 break-all text-sm text-gray-200 hover:text-indigo-300"
                            title={item.originalUrl}
                          >
                            {trimUrl(item.originalUrl)}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyHistoryLink(`original-${item.id}`, item.originalUrl)}
                            className="shrink-0 text-gray-400 hover:text-gray-200"
                            title="Copy original URL"
                          >
                            {copiedHistoryId === `original-${item.id}` ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          {expired ? (
                            <div
                              className="inline-flex min-w-0 flex-1 items-center gap-2 break-all rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-gray-500"
                              title="Expired links cannot be opened"
                            >
                              {item.shortUrl}
                              <ExternalLink className="h-4 w-4 shrink-0" />
                            </div>
                          ) : (
                            <a
                              href={item.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-w-0 flex-1 items-center gap-2 break-all rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-indigo-400 hover:text-indigo-300"
                            >
                              {item.shortUrl}
                              <ExternalLink className="h-4 w-4 shrink-0" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => copyHistoryLink(item.id, item.shortUrl)}
                            disabled={expired}
                            title={expired ? 'Expired links cannot be copied' : 'Copy shortened URL'}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {copiedHistoryId === item.id ? (
                              <>
                                <Check className="h-5 w-5 text-green-400" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-5 w-5" />
                                Copy
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openStatsDialog(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-indigo-200 transition-colors hover:bg-indigo-500/20"
                            title="Open visit stats"
                          >
                            <BarChart3 className="h-5 w-5" />
                            Stats
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteHistoryItemDialogId(item.id)}
                            disabled={deletingHistoryItemId === item.id}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingHistoryItemId === item.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                            Delete
                          </button>
                          {!expired ? (
                            <button
                              type="button"
                              onClick={() => setDeactivateDialogId(item.id)}
                              disabled={deactivatingId === item.id}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {deactivatingId === item.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Ban className="h-5 w-5" />
                              )}
                              Deactivate
                            </button>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {statsDialogItem ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Link statistics</h3>
                <p className="text-sm text-gray-400">{trimUrl(statsDialogItem.shortUrl, 65)}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatsDialogItem(null)}
                className="rounded-lg border border-gray-700 bg-gray-950 p-2 text-gray-300 hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                {(['7d', '30d', '90d', 'all'] as StatsPeriod[]).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => loadStatsForPeriod(period)}
                    disabled={isStatsLoading}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      statsPeriod === period
                        ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200'
                        : 'border-gray-700 bg-gray-950 text-gray-300 hover:bg-gray-800'
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {isStatsLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-gray-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading stats...
                </div>
              ) : statsError ? (
                <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {statsError}
                </p>
              ) : statsData ? (
                <>
                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400">Total visits</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{statsData.totalVisits}</p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400">Visits in period</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{statsData.visitsInPeriod}</p>
                    </div>
                  </div>

                  {statsData.series.length === 0 ? (
                    <p className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-8 text-center text-gray-400">
                      No visits in selected period.
                    </p>
                  ) : (
                    <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                      {(() => {
                        const chartWidth = 760
                        const chartHeight = 220
                        const paddingX = 24
                        const yAxisWidth = 36
                        const paddingTop = 16
                        const paddingBottom = 30
                        const maxVisits = Math.max(...statsData.series.map((x) => x.visits), 1)
                        const usableWidth = chartWidth - paddingX * 2 - yAxisWidth
                        const usableHeight = chartHeight - paddingTop - paddingBottom
                        const steps = Math.max(statsData.series.length - 1, 1)
                        const yTicks = 5
                        const yTickValues = Array.from({ length: yTicks }, (_, index) =>
                          Math.round((maxVisits * (yTicks - 1 - index)) / (yTicks - 1)),
                        )

                        const points = statsData.series.map((point, index) => {
                          const x = paddingX + yAxisWidth + (index / steps) * usableWidth
                          const y = paddingTop + ((maxVisits - point.visits) / maxVisits) * usableHeight
                          return { ...point, x, y }
                        })

                        const polyline = points.map((point) => `${point.x},${point.y}`).join(' ')
                        const startLabel = new Date(points[0].date).toLocaleDateString()
                        const endLabel = new Date(points[points.length - 1].date).toLocaleDateString()

                        return (
                          <>
                            <div className="mb-3 flex items-center justify-end text-xs text-gray-500">
                              <span>Max: {maxVisits}</span>
                            </div>
                            <svg
                              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                              className="h-52 w-full"
                              role="img"
                              aria-label="Visits trend chart"
                            >
                              {yTickValues.map((value, index) => {
                                const y = paddingTop + (index / (yTicks - 1)) * usableHeight
                                return (
                                  <g key={`tick-${value}-${index}`}>
                                    <line
                                      x1={paddingX + yAxisWidth}
                                      y1={y}
                                      x2={chartWidth - paddingX}
                                      y2={y}
                                      stroke="rgba(148,163,184,0.22)"
                                      strokeWidth="1"
                                    />
                                    <text
                                      x={paddingX + yAxisWidth - 8}
                                      y={y + 4}
                                      fill="rgba(148,163,184,0.9)"
                                      fontSize="11"
                                      textAnchor="end"
                                    >
                                      {value}
                                    </text>
                                  </g>
                                )
                              })}
                              <line
                                x1={paddingX + yAxisWidth}
                                y1={chartHeight - paddingBottom}
                                x2={chartWidth - paddingX}
                                y2={chartHeight - paddingBottom}
                                stroke="rgba(148,163,184,0.3)"
                                strokeWidth="1"
                              />
                              <polyline
                                fill="none"
                                stroke="rgba(99,102,241,0.95)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={polyline}
                              />
                              {points.map((point) => (
                                <g key={point.date}>
                                  <circle cx={point.x} cy={point.y} r="4" fill="rgb(129 140 248)" />
                                  <title>
                                    {new Date(point.date).toLocaleDateString()}: {point.visits}
                                  </title>
                                </g>
                              ))}
                            </svg>
                            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                              <span>{startLabel}</span>
                              <span>{endLabel}</span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {deactivateDialogId ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-white">Deactivate short link?</h3>
            <p className="mb-6 text-sm text-gray-400">
              This link will stop redirecting immediately. You can&apos;t undo this action.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeactivateDialogId(null)}
                disabled={Boolean(deactivatingId)}
                className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deactivateLink(deactivateDialogId)}
                disabled={deactivatingId === deactivateDialogId}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deactivatingId === deactivateDialogId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteHistoryItemDialogId ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-white">Delete history item?</h3>
            <p className="mb-6 text-sm text-gray-400">
              This will permanently remove the selected short link from your history.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteHistoryItemDialogId(null)}
                disabled={Boolean(deletingHistoryItemId)}
                className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteHistoryItem(deleteHistoryItemDialogId)}
                disabled={deletingHistoryItemId === deleteHistoryItemDialogId}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deletingHistoryItemId === deleteHistoryItemDialogId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isClearHistoryDialogOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-white">Clear link history?</h3>
            <p className="mb-6 text-sm text-gray-400">
              This will permanently remove all your shortened links from history.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsClearHistoryDialogOpen(false)}
                disabled={isClearingHistory}
                className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={clearHistory}
                disabled={isClearingHistory}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isClearingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Clear history
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={`fixed bottom-6 right-6 z-[60] rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'border-green-500/40 bg-green-500/10 text-green-200'
              : 'border-red-500/40 bg-red-500/10 text-red-200'
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </section>
  )
}

export default UrlShortenerPage

