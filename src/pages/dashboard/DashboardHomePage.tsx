import { useState } from 'react'
import {
  ArrowRight,
  Film,
  FileJson,
  Globe,
  Image as ImageIcon,
  Link2,
  QrCode,
  Sparkles,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const tools = [
  {
    icon: QrCode,
    title: 'QR Generator',
    description: 'Create PNG QR code from URL or text',
    color: 'from-blue-500 to-cyan-500',
    accent: 'text-cyan-300/90',
    path: '/dashboard/qr-generator',
  },
  {
    icon: Link2,
    title: 'URL Shortener',
    description: 'Generate short links instantly',
    color: 'from-indigo-500 to-purple-500',
    accent: 'text-violet-300/90',
    path: '/dashboard/url-shortener',
  },
  {
    icon: FileJson,
    title: 'JSON Formatter',
    description: 'Format or minify JSON payload',
    color: 'from-purple-500 to-pink-500',
    accent: 'text-fuchsia-300/90',
    path: '/dashboard/json-formatter',
  },
  {
    icon: Globe,
    title: 'IP Analyzer',
    description: 'Inspect geolocation and provider data',
    color: 'from-emerald-500 to-teal-500',
    accent: 'text-emerald-300/90',
    path: '/dashboard/ip-analyzer',
  },
  {
    icon: ImageIcon,
    title: 'File Converter',
    description: 'Convert image files between formats',
    color: 'from-orange-500 to-red-500',
    accent: 'text-orange-300/90',
    path: '/dashboard/file-converter',
  },
  {
    icon: Film,
    title: 'MP4 to GIF',
    description: 'Convert short MP4 clips to GIF',
    color: 'from-sky-500 to-indigo-500',
    accent: 'text-sky-300/90',
    path: '/dashboard/mp4-to-gif',
  },
]

const DashboardHomePage = () => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [proposalText, setProposalText] = useState('')

  const handleRequestSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Placeholder only: backend integration will be added later.
    setIsRequestModalOpen(false)
    setProposalText('')
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            Welcome to WebUtilities
          </h1>
          <p className="text-lg text-gray-400">Choose a tool and start working.</p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon

            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-800/80 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/35 hover:shadow-[0_8px_30px_rgba(79,70,229,0.18)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(99,102,241,0.18),transparent_55%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                <Icon
                  className={[
                    'pointer-events-none absolute right-3 top-3 h-20 w-20 stroke-1 opacity-12 transition-opacity duration-300 group-hover:opacity-20',
                    tool.accent,
                  ].join(' ')}
                />

                <div className="relative z-10 mb-5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${tool.color} shadow-lg shadow-black/25`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h2 className="relative z-10 mb-1.5 pr-10 text-2xl font-semibold text-white">{tool.title}</h2>
                <p className="relative z-10 text-sm leading-relaxed text-slate-300/80">
                  {tool.description}
                </p>
                <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-indigo-300" />
              </Link>
            )
          })}
        </div>

        <div className="relative mt-8 h-[220px] overflow-hidden rounded-2xl border border-indigo-400/30 bg-gradient-to-r from-indigo-600/85 via-violet-600/85 to-purple-600/85 p-8 shadow-[0_10px_35px_rgba(99,102,241,0.25)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.25),transparent_35%)]" />
          <div className="relative z-10 flex h-full items-center justify-between gap-6">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-white">Need a custom tool?</h2>
              <p className="text-lg text-indigo-100/90">
                Request new utilities or suggest improvements
              </p>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="mt-5 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
              >
                Submit Request
              </button>
            </div>
            <div className="hidden h-40 w-40 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm lg:flex">
              <Sparkles className="h-16 w-16 text-white/70" />
            </div>
          </div>
        </div>
      </div>

      {isRequestModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">Submit Request</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Describe the utility you would like to see in Utilify.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit}>
              <label className="mb-2 block text-sm font-medium text-slate-300">Proposal</label>
              <textarea
                value={proposalText}
                onChange={(event) => setProposalText(event.target.value)}
                rows={6}
                placeholder="For example: Add PDF merge utility with drag-and-drop files and page sorting."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default DashboardHomePage

