import { useState } from 'react'
import { Download, Loader2, Upload, Video } from 'lucide-react'
import axios from 'axios'
import { api } from '../../services/api'

type FpsOption = 10 | 15 | 24 | 30 | 45 | 60

const maxFileSizeBytes = 15 * 1024 * 1024

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? fallback
  }

  return fallback
}

const Mp4ToGifPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [fps, setFps] = useState<FpsOption>(15)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)

  const validateVideoFile = (candidate: File | null) => {
    if (!candidate) {
      return 'Please choose a video file.'
    }

    if (!candidate.type.startsWith('video/')) {
      return 'Only video files are supported.'
    }

    if (candidate.size > maxFileSizeBytes) {
      return 'File size must be 15 MB or smaller.'
    }

    return null
  }

  const setSelectedFile = (candidate: File | null) => {
    const validationError = validateVideoFile(candidate)
    if (validationError) {
      setFile(null)
      setErrorMessage(validationError)
      return
    }

    setFile(candidate)
    setErrorMessage(null)
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    setSelectedFile(event.dataTransfer.files?.[0] ?? null)
  }

  const handleConvert = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateVideoFile(file)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file as File)
      formData.append('fps', String(fps))

      const response = await api.post('/api/utilities/video/to-gif', formData, { responseType: 'blob' })
      const blob = response.data as Blob
      const objectUrl = URL.createObjectURL(blob)

      setGifUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl)
        }

        return objectUrl
      })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to convert video to GIF.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!gifUrl) {
      return
    }

    const anchor = document.createElement('a')
    anchor.href = gifUrl
    anchor.download = 'converted.gif'
    anchor.click()
  }

  return (
    <section className="min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">MP4 to GIF Converter</h1>
          <p className="text-lg text-gray-400">
            Convert short MP4 clips into optimized GIFs (up to 10s, 15 MB input).
          </p>
        </header>

        <form onSubmit={handleConvert} className="rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8">
          <label
            className={`mb-5 block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-700 hover:border-indigo-500'
            }`}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10">
              <Upload className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="mb-1 font-medium text-white">Drag & drop video file here or click to choose</p>
            <p className="text-sm text-gray-400">Hard limits: max 15 MB, max 10 seconds</p>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {file ? (
            <p className="mb-4 rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-300">
              {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          ) : null}

          <div className="mb-6">
            <span className="mb-2 block text-sm text-gray-300">Frame Rate (FPS)</span>
            <select
              value={fps}
              onChange={(event) => setFps(Number(event.target.value) as FpsOption)}
              className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10 FPS</option>
              <option value={15}>15 FPS</option>
              <option value={24}>24 FPS</option>
              <option value={30}>30 FPS</option>
              <option value={45}>45 FPS</option>
              <option value={60}>60 FPS</option>
            </select>
            {fps >= 24 ? (
              <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                Higher FPS can significantly increase the final GIF size.
              </p>
            ) : null}
          </div>

          {errorMessage ? (
            <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
              {isProcessing ? 'Processing...' : 'Convert to GIF'}
            </button>
          </div>
        </form>

        {gifUrl ? (
          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="mb-4 text-sm text-gray-300">Converted GIF preview</p>
            <div className="mb-4 overflow-hidden rounded-lg border border-gray-800 bg-gray-950 p-4">
              <img src={gifUrl} alt="Converted GIF preview" className="mx-auto max-h-96 w-auto" />
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Download className="h-5 w-5" />
              Save GIF
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Mp4ToGifPage
