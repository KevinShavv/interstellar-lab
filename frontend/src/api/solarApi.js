const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

export const solarApi = {
  getHealth: () => getJson('/health/'),
  getModules: () => getJson('/modules/'),
  getScenes: () => getJson('/scenes/'),
  getScene: (slug) => getJson(`/scenes/${slug}/`),
  getPlanets: () => getJson('/planets/'),
  getSolarSystemConfig: () => getJson('/solar-system/config/'),
  getHorizons: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return getJson(`/horizons/?${query}`)
  },
  // Skyfield 本地星历（替代 NASA Horizons，国内可用）
  getSkyfieldPosition: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return getJson(`/skyfield/?${query}`)
  },
}
