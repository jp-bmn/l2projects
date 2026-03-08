import { apiCall } from '../lib/apiClient'

const MOCK_ALERTS = [
  { id: 1, alert_type: 'HVAC', severity: 'critical', title: 'HVAC Overload – Floor 42', description: 'Unit 42-A drawing 340% above baseline. Immediate inspection required.', created_at: '2026-04-01T14:22:00Z' },
  { id: 2, alert_type: 'WATER', severity: 'warning', title: 'Water Pressure Anomaly – Floor 18', description: 'Pressure reading 18% below normal. Possible leak detected in riser.', created_at: '2026-04-01T11:05:00Z' },
  { id: 3, alert_type: 'LIGHTING', severity: 'info', title: 'Lights On After Hours – Floor 7', description: 'Occupancy sensors show no motion but lighting remains active since 11 PM.', created_at: '2026-04-01T23:10:00Z' },
]

export const getAlerts = async (buildingId) => {
  if (!buildingId) return MOCK_ALERTS
  try {
    const data = await apiCall(`/alerts/${buildingId}`)
    return Array.isArray(data) ? data : MOCK_ALERTS
  } catch {
    return MOCK_ALERTS
  }
}

export const getAlertCount = async (buildingId) => {
  const alerts = await getAlerts(buildingId)
  return { count: alerts.length }
}
