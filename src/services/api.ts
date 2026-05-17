import axios, { AxiosHeaders } from 'axios'

export const API_BASE_URL = 'https://localhost:7014'
const ACCESS_TOKEN_STORAGE_KEY = 'webutilities_access_token'

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export const removeAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

export const extractAccessToken = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const data = payload as Record<string, unknown>

  const candidate =
    data.accessToken ?? data.access_token ?? data.token ?? data.jwt ?? null

  return typeof candidate === 'string' && candidate.length > 0
    ? candidate
    : null
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set('Authorization', `Bearer ${token}`)
    config.headers = headers
  }

  return config
})

