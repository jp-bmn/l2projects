import { apiCall } from '../lib/apiClient'

const MOCK_ENERGY_READINGS = [
  { day: 'Mon', kwh_actual: 820, kwh_limit: 900 },
  { day: 'Tue', kwh_actual: 910, kwh_limit: 900 },
  { day: 'Wed', kwh_actual: 875, kwh_limit: 900 },
  { day: 'Thu', kwh_actual: 760, kwh_limit: 900 },
  { day: 'Fri', kwh_actual: 930, kwh_limit: 900 },
  { day: 'Sat', kwh_actual: 680, kwh_limit: 900 },
  { day: 'Sun', kwh_actual: 847, kwh_limit: 900 },
]

const MOCK_CURRENT_USAGE = {
  current_kw: 847,
  change_pct: 12,
  direction: 'up',
  unit: 'kW',
}

const MOCK_FLOOR_HEATMAP = Array.from({ length: 30 }, (_, i) => ({
  floor: i + 1,
  energy_status: i % 7 === 3 ? 'critical' : i % 5 === 2 ? 'elevated' : 'normal',
  kwh: Math.round(28 + Math.random() * 20),
}))

export const getEnergyReadings = async (buildingId, days = 7) => {
  if (!buildingId) return MOCK_ENERGY_READINGS
  try {
    const data = await apiCall(`/energy/${buildingId}?days=${days}`)
    return Array.isArray(data) ? data : MOCK_ENERGY_READINGS
  } catch {
    return MOCK_ENERGY_READINGS
  }
}

export const getCurrentUsage = async (buildingId) => {
  if (!buildingId) return MOCK_CURRENT_USAGE
  try {
    const data = await apiCall(`/energy/${buildingId}/current`)
    return data || MOCK_CURRENT_USAGE
  } catch {
    return MOCK_CURRENT_USAGE
  }
}

export const getFloorHeatmap = async (buildingId) => {
  if (!buildingId) return MOCK_FLOOR_HEATMAP
  try {
    const data = await apiCall(`/energy/${buildingId}/floors`)
    return Array.isArray(data) ? data : MOCK_FLOOR_HEATMAP
  } catch {
    return MOCK_FLOOR_HEATMAP
  }
}
