import { apiCall } from '../lib/apiClient'

const MOCK_BUILDINGS = [
  { id: 1,  name: '30 Hudson Yards',            address: '30 Hudson Yards, New York, NY 10001',           borough: 'Manhattan',     floors: 73,  gross_sq_ft: 2600000 },
  { id: 2,  name: 'One World Trade Center',     address: '285 Fulton St, New York, NY 10007',             borough: 'Manhattan',     floors: 104, gross_sq_ft: 3500000 },
  { id: 3,  name: '432 Park Avenue',            address: '432 Park Ave, New York, NY 10022',              borough: 'Manhattan',     floors: 96,  gross_sq_ft: 396000  },
  { id: 4,  name: 'Empire State Building',      address: '20 W 34th St, New York, NY 10001',              borough: 'Manhattan',     floors: 102, gross_sq_ft: 2768591 },
  { id: 5,  name: 'One Vanderbilt',             address: '1 Vanderbilt Ave, New York, NY 10017',          borough: 'Manhattan',     floors: 67,  gross_sq_ft: 1657198 },
  { id: 6,  name: '111 Wall Street',            address: '111 Wall St, New York, NY 10005',               borough: 'Manhattan',     floors: 33,  gross_sq_ft: 1258500 },
  { id: 7,  name: 'Yankee Stadium',             address: '1 E 161st St, Bronx, NY 10451',                borough: 'Bronx',         floors: 8,   gross_sq_ft: 1900000 },
  { id: 8,  name: 'Barclays Center',            address: '620 Atlantic Ave, Brooklyn, NY 11217',          borough: 'Brooklyn',      floors: 6,   gross_sq_ft: 675000  },
  { id: 9,  name: 'Queens Center Mall',         address: '90-15 Queens Blvd, Elmhurst, NY 11373',        borough: 'Queens',        floors: 3,   gross_sq_ft: 1000000 },
  { id: 10, name: 'Staten Island Borough Hall', address: '10 Richmond Terrace, Staten Island, NY 10301', borough: 'Staten Island', floors: 5,   gross_sq_ft: 90000   },
]

const MOCK_COMPLIANCE = {
  building_id: 1,
  ll97_emissions_pct: 73,
  energy_intensity_pct: 58,
  carbon_offset_pct: 41,
  fine_risk_amount: 42000,
  deadline: '2026-05-01',
  days_remaining: 60,
}

export const getBuildings = async () => {
  try {
    const data = await apiCall('/buildings')
    return Array.isArray(data) ? data : MOCK_BUILDINGS
  } catch {
    return MOCK_BUILDINGS
  }
}

export const getBuildingById = async (id) => {
  try {
    const data = await apiCall(`/buildings/${id}`)
    return data || MOCK_BUILDINGS.find(b => b.id === id) || null
  } catch {
    return MOCK_BUILDINGS.find(b => b.id === id) || null
  }
}

export const getLL97Data = async (buildingId) => {
  try {
    const data = await apiCall(`/buildings/${buildingId}/ll97`)
    return data || {}
  } catch {
    return {}
  }
}

export const getComplianceSnapshot = async (buildingId) => {
  try {
    const data = await apiCall(`/buildings/${buildingId}/compliance`)
    return (data && data.ll97_emissions_pct != null) ? data : MOCK_COMPLIANCE
  } catch {
    return MOCK_COMPLIANCE
  }
}
