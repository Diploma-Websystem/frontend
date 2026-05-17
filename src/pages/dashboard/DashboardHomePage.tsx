import {
  ArrowRight,
  FileJson,
  Globe,
  Image as ImageIcon,
  Link2,
  QrCode,
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
]

const DashboardHomePage = () => {
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
      </div>
    </section>
  )
}

export default DashboardHomePage

