import axios from 'axios'

export const api = axios.create({
  // TODO: Verify backend HTTPS port from ASP.NET Core launch settings.
  baseURL: 'https://localhost:7234',
  withCredentials: true,
})

