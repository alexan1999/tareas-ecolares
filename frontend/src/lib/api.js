const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, token } = options
  const headers = {}

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json')

  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const message = data?.error || data?.message || 'Error de servidor'
    throw new Error(message)
  }

  return data
}
