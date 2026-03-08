/**
 * API client configuration
 * Points to local Express backend at localhost:4000
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (err) {
    console.error(`[API] ${endpoint}:`, err.message)
    throw err
  }
}

export { API_BASE_URL }
