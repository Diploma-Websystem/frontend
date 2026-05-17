import { useState } from 'react'
import { Download, Loader2, QrCode } from 'lucide-react'
import axios from 'axios'
import { api } from '../../services/api'

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? fallback
  }

  return fallback
}

const QrGeneratorPage = () => {
  const [text, setText] = useState('')
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedText = text.trim()
    if (!normalizedText) {
      setErrorMessage('Please enter text or URL.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await api.post('/api/utilities/qr', { text: normalizedText }, { responseType: 'blob' })
      const blob = response.data as Blob
      const imageUrl = URL.createObjectURL(blob)
      setQrImageUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return imageUrl
      })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to generate QR code.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrImageUrl) {
      return
    }

    const anchor = document.createElement('a')
    anchor.href = qrImageUrl
    anchor.download = 'qr.png'
    anchor.click()
  }

  return (
    <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">QR Code Generator</h1>
          <p className="text-lg text-gray-400">Generate QR code PNG from text or URL.</p>
        </header>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8">
          <form onSubmit={handleGenerate}>
            <label className="mb-2 block text-sm font-medium text-gray-300">Text or URL</label>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="https://example.com or any text"
              className="h-32 w-full resize-none rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5" />}
              {isLoading ? 'Generating...' : 'Generate QR'}
            </button>
          </form>

          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          {qrImageUrl ? (
            <div className="mt-8 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6">
              <div className="mx-auto mb-5 w-fit rounded-lg bg-white p-4">
                <img src={qrImageUrl} alt="Generated QR code" className="h-64 w-64 object-contain" />
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Download className="h-5 w-5" />
                Download PNG
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default QrGeneratorPage

