import { useEffect, useState } from 'react'
import { Flame, Loader2 } from 'lucide-react'
import { api } from '../../services/api'

interface TrendingUtilityResponse {
  utilityName: string
  usageCount: number
}

const TrendingUtilityWidget = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [trending, setTrending] = useState<TrendingUtilityResponse | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadTrending = async () => {
      try {
        const { data } = await api.get<TrendingUtilityResponse | null>('/api/analytics/trending')
        if (!isMounted) {
          return
        }

        setTrending(data)
      } catch {
        if (!isMounted) {
          return
        }

        setIsError(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTrending()

    return () => {
      isMounted = false
    }
  }, [])

  if (isError || (!isLoading && !trending)) {
    return null
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/30 bg-white/15 p-4 shadow-lg backdrop-blur-md">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-white/85">
          <Flame className="h-4 w-4 text-orange-200" />
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading trends...
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-white/95">
          <Flame className="h-4 w-4 text-orange-200" />
          <span className="font-semibold">Trending this week - {trending?.utilityName}</span>
        </div>
      )}
    </div>
  )
}

export default TrendingUtilityWidget
