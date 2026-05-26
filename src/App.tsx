import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/routing/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardHomePage from './pages/dashboard/DashboardHomePage'
import FileConverterPage from './pages/dashboard/FileConverterPage'
import IpAnalyzerPage from './pages/dashboard/IpAnalyzerPage'
import JsonFormatterPage from './pages/dashboard/JsonFormatterPage'
import Mp4ToGifPage from './pages/dashboard/Mp4ToGifPage'
import QrGeneratorPage from './pages/dashboard/QrGeneratorPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import UrlShortenerPage from './pages/dashboard/UrlShortenerPage'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/signup', element: <RegisterPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: 'qr-generator', element: <QrGeneratorPage /> },
      { path: 'url-shortener', element: <UrlShortenerPage /> },
      { path: 'json-formatter', element: <JsonFormatterPage /> },
      { path: 'ip-analyzer', element: <IpAnalyzerPage /> },
      { path: 'file-converter', element: <FileConverterPage /> },
      { path: 'mp4-to-gif', element: <Mp4ToGifPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
