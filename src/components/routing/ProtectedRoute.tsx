import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { api, getAccessToken } from '../../services/api'

interface ProtectedRouteProps {
  redirectTo?: string
  children?: ReactNode
}

const ProtectedRoute = ({ redirectTo = '/login', children }: ProtectedRouteProps) => {
  const location = useLocation()
  const [hasSession, setHasSession] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const token = getAccessToken()

  useEffect(() => {
    const checkSession = async () => {
      if (token) {
        setHasSession(true)
        setIsChecking(false)
        return
      }

      try {
        await api.get('/auth/me')
        setHasSession(true)
      } catch {
        setHasSession(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkSession()
  }, [token])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (!hasSession) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute

