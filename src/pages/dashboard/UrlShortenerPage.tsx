import { useState } from 'react'
import { Check, Copy, ExternalLink, Link2, Loader2 } from 'lucide-react'
import axios from 'axios'
import { api } from '../../services/api'

interface ShortenResponse {
  shortCode?: string
  shortUrl?: string
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
  const [result, setResult] = useState<ShortenResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

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

  return (
    <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            Shorten your long links
          </h1>
          <p className="text-lg text-gray-400">
            Create short, memorable URLs for sharing.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm sm:p-8">
          <form className="mb-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
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
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Link2 className="h-5 w-5" />}
              {isLoading ? 'Shortening...' : 'Shorten'}
            </button>
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
    </section>
  )
}

export default UrlShortenerPage

