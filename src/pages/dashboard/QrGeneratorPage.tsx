import { useState } from 'react'
import { Check, Copy, Download, History, Loader2, QrCode, RotateCcw, Trash2, X } from 'lucide-react'
import axios from 'axios'
import { api } from '../../services/api'

type QrSizeOption = '256' | '512' | '1024'
type ErrorCorrectionOption = 'low' | 'medium' | 'high'

interface QrHistoryItem {
  id: string
  content: string
  createdAt: string
}

type ToastType = 'success' | 'error'

interface ToastState {
  message: string
  type: ToastType
}

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
  const [qrSize, setQrSize] = useState<QrSizeOption>('256')
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionOption>('low')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyItems, setHistoryItems] = useState<QrHistoryItem[]>([])
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null)
  const [deleteHistoryItemDialogId, setDeleteHistoryItemDialogId] = useState<string | null>(null)
  const [deletingHistoryItemId, setDeletingHistoryItemId] = useState<string | null>(null)
  const [isClearHistoryDialogOpen, setIsClearHistoryDialogOpen] = useState(false)
  const [isClearingHistory, setIsClearingHistory] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const previewSizeClass =
    qrSize === '1024' ? 'h-80 w-80' : qrSize === '512' ? 'h-72 w-72' : 'h-64 w-64'

  const generateQrForText = async (rawText: string) => {
    const normalizedText = rawText.trim()
    if (!normalizedText) {
      setErrorMessage('Please enter text or URL.')
      return false
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await api.post(
        '/api/utilities/qr',
        {
          text: normalizedText,
          size: Number(qrSize),
          errorCorrection,
        },
        { responseType: 'blob' },
      )
      const blob = response.data as Blob
      const imageUrl = URL.createObjectURL(blob)
      setQrImageUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return imageUrl
      })
      return true
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to generate QR code.'))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await generateQrForText(text)
  }

  const loadHistory = async () => {
    setIsHistoryOpen(true)
    setIsHistoryLoading(true)
    setHistoryError(null)

    try {
      const { data } = await api.get<QrHistoryItem[]>('/api/utilities/qr/history')
      setHistoryItems(data)
    } catch (error) {
      setHistoryError(
        getApiErrorMessage(error, 'Failed to load QR history. Please sign in and try again.')
      )
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const clearHistory = async () => {
    setIsClearingHistory(true)
    setHistoryError(null)

    try {
      await api.delete('/api/utilities/qr/history')
      setHistoryItems([])
      setIsClearHistoryDialogOpen(false)
      showToast('QR history cleared.', 'success')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to clear QR history.')
      setHistoryError(message)
      showToast(message, 'error')
    } finally {
      setIsClearingHistory(false)
    }
  }

  const reloadHistory = async () => {
    const { data } = await api.get<QrHistoryItem[]>('/api/utilities/qr/history')
    setHistoryItems(data)
  }

  const deleteHistoryItem = async (id: string) => {
    setDeletingHistoryItemId(id)
    setHistoryError(null)

    try {
      await api.delete(`/api/utilities/qr/history/${id}`)
      await reloadHistory()
      setDeleteHistoryItemDialogId(null)
      showToast('QR history item deleted.', 'success')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to delete QR history item.')
      setHistoryError(message)
      showToast(message, 'error')
    } finally {
      setDeletingHistoryItemId(null)
    }
  }

  const handleRegenerate = async (content: string) => {
    setText(content)
    const success = await generateQrForText(content)
    if (success) {
      setIsHistoryOpen(false)
    }
  }

  const handleCopyHistoryContent = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedHistoryId(id)
    setTimeout(() => setCopiedHistoryId(null), 1500)
  }

  const trimContent = (value: string, max = 90) => {
    if (value.length <= max) return value
    return `${value.slice(0, max)}...`
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
        <header className="mb-10 flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">QR Code Generator</h1>
            <p className="text-lg text-gray-400">Generate QR code PNG from text or URL.</p>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800"
          >
            <History className="h-4 w-4" />
            My QR History
          </button>
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
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-medium text-gray-300">Size</span>
                <select
                  value={qrSize}
                  onChange={(event) => setQrSize(event.target.value as QrSizeOption)}
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="256">Small (256x256)</option>
                  <option value="512">Medium (512x512)</option>
                  <option value="1024">Large (1024x1024)</option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-gray-300">Error Correction</span>
                <select
                  value={errorCorrection}
                  onChange={(event) =>
                    setErrorCorrection(event.target.value as ErrorCorrectionOption)
                  }
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
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
                <img
                  src={qrImageUrl}
                  alt="Generated QR code"
                  className={`${previewSizeClass} object-contain`}
                />
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

        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-3 text-2xl font-semibold text-white">Pro Tips</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>- Higher error correction allows the QR code to be read even if partially damaged.</li>
            <li>- Keep URLs short for simpler, easier-to-scan QR codes.</li>
            <li>- Test your QR code with multiple devices before printing.</li>
          </ul>
        </div>
      </div>

      {isHistoryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-white">My QR History</h2>
                <p className="text-sm text-gray-400">Use previous entries and regenerate instantly.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsClearHistoryDialogOpen(true)}
                  disabled={isHistoryLoading || historyItems.length === 0}
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
              ) : historyItems.length === 0 ? (
                <p className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-8 text-center text-gray-400">
                  You have not generated QR codes yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {historyItems.map((item) => (
                    <article key={item.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500">
                          Created: {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="mb-2 text-sm text-gray-400">Content</p>
                      <div className="mb-4 flex items-center gap-2">
                        <p
                          className="min-w-0 flex-1 break-all text-sm text-gray-200"
                          title={item.content}
                        >
                          {trimContent(item.content)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopyHistoryContent(item.id, item.content)}
                          className="shrink-0 text-gray-400 hover:text-gray-200"
                          title="Copy content"
                        >
                          {copiedHistoryId === item.id ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRegenerate(item.content)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteHistoryItemDialogId(item.id)}
                        disabled={deletingHistoryItemId === item.id}
                        className="ml-3 inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingHistoryItemId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {deleteHistoryItemDialogId ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-white">Delete QR history item?</h3>
            <p className="mb-6 text-sm text-gray-400">
              This will permanently remove the selected QR entry from history.
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
            <h3 className="mb-2 text-lg font-semibold text-white">Clear QR history?</h3>
            <p className="mb-6 text-sm text-gray-400">
              This will permanently remove all generated QR history records.
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

export default QrGeneratorPage

