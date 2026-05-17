import { useMemo, useState } from 'react'
import { Download, Image as ImageIcon, Loader2, Upload } from 'lucide-react'
import axios from 'axios'
import { api } from '../../services/api'

type OutputFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'bmp' | 'tiff'

const outputFormats: OutputFormat[] = ['png', 'jpeg', 'webp', 'gif', 'bmp', 'tiff']

const parseFilenameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) {
    return null
  }

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1])
  }

  const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
  return basicMatch?.[1] ?? null
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? fallback
  }

  return fallback
}

const FileConverterPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png')
  const [quality, setQuality] = useState(90)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState('converted-image.png')

  const selectedFileInfo = useMemo(() => {
    if (!file) {
      return null
    }

    return `${file.name} • ${(file.size / 1024).toFixed(1)} KB`
  }, [file])

  const handleFileChange = (nextFile: File | null) => {
    setFile(nextFile)
    setErrorMessage(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
      setErrorMessage('Please choose an image file first.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Only image files are supported.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('outputFormat', outputFormat)
      formData.append('quality', String(quality))

      const response = await api.post('/api/utilities/file-converter', formData, {
        responseType: 'blob',
      })

      const blob = response.data as Blob
      const objectUrl = URL.createObjectURL(blob)

      setPreviewUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl)
        }
        return objectUrl
      })

      const contentDispositionHeader = response.headers['content-disposition']
      const parsedName = parseFilenameFromDisposition(contentDispositionHeader)
      setDownloadName(parsedName ?? `converted-image.${outputFormat}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to convert file.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!previewUrl) {
      return
    }

    const anchor = document.createElement('a')
    anchor.href = previewUrl
    anchor.download = downloadName
    anchor.click()
  }

  return (
    <section className="min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">File Converter</h1>
          <p className="text-lg text-gray-400">Convert image files via backend API.</p>
        </header>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8">
          <label className="mb-5 block cursor-pointer rounded-xl border-2 border-dashed border-gray-700 p-8 text-center hover:border-indigo-500">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10">
              <Upload className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="mb-1 font-medium text-white">Click to choose an image</p>
            <p className="text-sm text-gray-400">PNG, JPEG, WEBP, GIF, BMP, TIFF</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
          </label>

          {selectedFileInfo ? (
            <p className="mb-4 rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-300">
              {selectedFileInfo}
            </p>
          ) : null}

          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Output format</span>
              <select
                value={outputFormat}
                onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}
                className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {outputFormats.map((format) => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Quality ({quality}%)</span>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="mt-2 w-full accent-indigo-500"
              />
            </label>
          </div>

          {errorMessage ? (
            <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
            {isLoading ? 'Converting...' : 'Convert file'}
          </button>
        </form>

        {previewUrl ? (
          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="mb-4 text-sm text-gray-300">Converted preview</p>
            <div className="mb-4 overflow-hidden rounded-lg border border-gray-800 bg-gray-950 p-4">
              <img src={previewUrl} alt="Converted file preview" className="mx-auto max-h-96 w-auto" />
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Download className="h-5 w-5" />
              Download converted file
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default FileConverterPage

