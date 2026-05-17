import { Image as ImageIcon, Upload } from 'lucide-react'

const FileConverterPage = () => {
  return (
    <section className="min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">File Converter</h1>
          <p className="text-lg text-gray-400">
            Convert and optimize files. API integration can be added next.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
          <div className="rounded-xl border-2 border-dashed border-gray-700 p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10">
              <Upload className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="mb-2 font-medium text-white">Drag and drop your file here</p>
            <p className="text-sm text-gray-400">or click to browse from your device</p>
          </div>

          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <ImageIcon className="h-5 w-5 text-indigo-400" />
              Planned features
            </h2>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>- Format conversion (PNG/JPEG/WEBP)</li>
              <li>- Resize and compression controls</li>
              <li>- Batch processing</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FileConverterPage

