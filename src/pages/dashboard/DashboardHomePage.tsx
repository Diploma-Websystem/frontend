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
    path: '/dashboard/qr-generator',
  },
  {
    icon: Link2,
    title: 'URL Shortener',
    description: 'Generate short links instantly',
    color: 'from-indigo-500 to-purple-500',
    path: '/dashboard/url-shortener',
  },
  {
    icon: FileJson,
    title: 'JSON Formatter',
    description: 'Format or minify JSON payload',
    color: 'from-purple-500 to-pink-500',
    path: '/dashboard/json-formatter',
  },
  {
    icon: Globe,
    title: 'IP Analyzer',
    description: 'Inspect geolocation and provider data',
    color: 'from-emerald-500 to-teal-500',
    path: '/dashboard/ip-analyzer',
  },
  {
    icon: ImageIcon,
    title: 'File Converter',
    description: 'Convert image files between formats',
    color: 'from-orange-500 to-red-500',
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon

            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${tool.color}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-indigo-400" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-white">{tool.title}</h2>
                <p className="text-sm leading-relaxed text-gray-400">{tool.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default DashboardHomePage

