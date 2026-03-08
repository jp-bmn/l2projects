import { apiCall } from '../lib/apiClient'

const MOCK_SOLAR = {
  output_kw: 214,
  change_pct: 3,
  direction: 'down',
  output_kwh_today: 1240,
  co2_offset_tons: 0.82,
  money_saved: 186,
  capacity_pct: 68,
  ac_score: 82,
  e_score: 74,
  h_score: 61,
}

export const getSolarReadings = async (buildingId) => {
  if (!buildingId) return MOCK_SOLAR
  try {
    const data = await apiCall(`/solar/${buildingId}`)
    return data || MOCK_SOLAR
  } catch {
    return MOCK_SOLAR
  }
}

export const getSolarPerformance = getSolarReadings
