import { apiCall } from '../lib/apiClient'

const MOCK_SENSORS = [
  { id: 1, sensor_type: 'HVAC', status: 'WARN', last_heartbeat: new Date().toISOString(), location: 'Roof & Mechanical' },
  { id: 2, sensor_type: 'Lighting', status: 'ONLINE', last_heartbeat: new Date().toISOString(), location: 'All Floors' },
  { id: 3, sensor_type: 'Solar', status: 'ONLINE', last_heartbeat: new Date().toISOString(), location: 'Roof Array' },
  { id: 4, sensor_type: 'Water', status: 'ONLINE', last_heartbeat: new Date().toISOString(), location: 'Risers & Basement' },
  { id: 5, sensor_type: 'Backup Power', status: 'ONLINE', last_heartbeat: new Date().toISOString(), location: 'Basement Level B2' },
]

export const getSensors = async (buildingId) => {
  if (!buildingId) return MOCK_SENSORS
  try {
    const data = await apiCall(`/sensors/${buildingId}`)
    return Array.isArray(data) ? data : MOCK_SENSORS
  } catch {
    return MOCK_SENSORS
  }
}

export const getSensorStatus = async (buildingId) => {
  const sensors = await getSensors(buildingId)
  const anyOnline = sensors.some(s => s.status === 'ONLINE')
  const latest = sensors[0]
  return {
    online: anyOnline,
    last_heartbeat: latest?.last_heartbeat || new Date().toISOString(),
  }
}
