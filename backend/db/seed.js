const { initDb, getDB, saveDb } = require('./database')

;(async () => {
  await initDb()
  const db = getDB()

  console.log('🌱 Seeding GreenEyes NYC database...')

  // Clear existing data
  db.exec(`
  DELETE FROM user_buildings;
  DELETE FROM users;
  DELETE FROM floors;
  DELETE FROM sensors;
  DELETE FROM alerts;
  DELETE FROM solar_readings;
  DELETE FROM energy_readings;
  DELETE FROM compliance_snapshots;
  DELETE FROM ll97_limits;
  DELETE FROM buildings;
`)

// ── Buildings ──
const insertBuilding = db.prepare(`
  INSERT INTO buildings (name, address, borough, year_built, floors, gross_sq_ft, owner)
  VALUES (@name, @address, @borough, @year_built, @floors, @gross_sq_ft, @owner)
`)

const buildings = [
  { name: '30 Hudson Yards',          address: '30 Hudson Yards, New York, NY 10001',       borough: 'Manhattan', year_built: 2019, floors: 73,  gross_sq_ft: 2600000, owner: 'Related Companies' },
  { name: 'One World Trade Center',   address: '285 Fulton St, New York, NY 10007',          borough: 'Manhattan', year_built: 2014, floors: 104, gross_sq_ft: 3500000, owner: 'Port Authority' },
  { name: '432 Park Avenue',          address: '432 Park Ave, New York, NY 10022',           borough: 'Manhattan', year_built: 2015, floors: 96,  gross_sq_ft: 396000,  owner: 'CIM Group' },
  { name: 'Empire State Building',    address: '20 W 34th St, New York, NY 10001',           borough: 'Manhattan', year_built: 1931, floors: 102, gross_sq_ft: 2768591, owner: 'Empire State Realty Trust' },
  { name: 'One Vanderbilt',           address: '1 Vanderbilt Ave, New York, NY 10017',       borough: 'Manhattan', year_built: 2020, floors: 67,  gross_sq_ft: 1657198, owner: 'SL Green Realty' },
  { name: '111 Wall Street',          address: '111 Wall St, New York, NY 10005',            borough: 'Manhattan', year_built: 1969, floors: 33,  gross_sq_ft: 1258500, owner: 'Wafra Capital Partners' },
  { name: 'Yankee Stadium',           address: '1 E 161st St, Bronx, NY 10451',             borough: 'Bronx',     year_built: 2009, floors: 8,   gross_sq_ft: 1900000, owner: 'New York Yankees' },
  { name: 'Barclays Center',          address: '620 Atlantic Ave, Brooklyn, NY 11217',       borough: 'Brooklyn',  year_built: 2012, floors: 6,   gross_sq_ft: 675000,  owner: 'BSE Global' },
  { name: 'Queens Center Mall',       address: '90-15 Queens Blvd, Elmhurst, NY 11373',     borough: 'Queens',    year_built: 1973, floors: 3,   gross_sq_ft: 1000000, owner: 'Macerich' },
  { name: 'Staten Island Borough Hall', address: '10 Richmond Terrace, Staten Island, NY 10301', borough: 'Staten Island', year_built: 1906, floors: 5, gross_sq_ft: 90000, owner: 'NYC Government' },
]

const buildingIds = buildings.map(b => insertBuilding.run(b).lastInsertRowid)

// ── LL97 Limits ──
const insertLL97 = db.prepare(`
  INSERT INTO ll97_limits (building_id, year, carbon_limit, energy_limit, fine_per_ton)
  VALUES (@building_id, @year, @carbon_limit, @energy_limit, @fine_per_ton)
`)
const ll97Configs = [
  { carbon_limit: 4.2,  energy_limit: 38.5, fine_per_ton: 268 },
  { carbon_limit: 4.2,  energy_limit: 38.5, fine_per_ton: 268 },
  { carbon_limit: 4.2,  energy_limit: 38.5, fine_per_ton: 268 },
  { carbon_limit: 5.1,  energy_limit: 42.0, fine_per_ton: 268 },
  { carbon_limit: 3.8,  energy_limit: 35.0, fine_per_ton: 268 },
  { carbon_limit: 6.2,  energy_limit: 50.0, fine_per_ton: 268 },
  { carbon_limit: 8.5,  energy_limit: 65.0, fine_per_ton: 268 },
  { carbon_limit: 7.2,  energy_limit: 58.0, fine_per_ton: 268 },
  { carbon_limit: 9.0,  energy_limit: 70.0, fine_per_ton: 268 },
  { carbon_limit: 3.5,  energy_limit: 32.0, fine_per_ton: 268 },
]
buildingIds.forEach((id, i) => {
  insertLL97.run({ building_id: id, year: 2026, ...ll97Configs[i] })
})

// ── Compliance Snapshots ──
const insertCompliance = db.prepare(`
  INSERT INTO compliance_snapshots (building_id, snapshot_date, ll97_emissions_pct, energy_intensity_pct, carbon_offset_pct, fine_risk_amount, days_remaining, deadline)
  VALUES (@building_id, @snapshot_date, @ll97_emissions_pct, @energy_intensity_pct, @carbon_offset_pct, @fine_risk_amount, @days_remaining, @deadline)
`)
const today = new Date().toISOString().split('T')[0]
const complianceData = [
  { ll97_emissions_pct: 73, energy_intensity_pct: 58, carbon_offset_pct: 41, fine_risk_amount: 42000 },
  { ll97_emissions_pct: 61, energy_intensity_pct: 49, carbon_offset_pct: 55, fine_risk_amount: 18500 },
  { ll97_emissions_pct: 88, energy_intensity_pct: 71, carbon_offset_pct: 29, fine_risk_amount: 74000 },
  { ll97_emissions_pct: 95, energy_intensity_pct: 82, carbon_offset_pct: 18, fine_risk_amount: 112000 },
  { ll97_emissions_pct: 34, energy_intensity_pct: 28, carbon_offset_pct: 78, fine_risk_amount: 0 },
  { ll97_emissions_pct: 102, energy_intensity_pct: 91, carbon_offset_pct: 12, fine_risk_amount: 187000 },
  { ll97_emissions_pct: 58, energy_intensity_pct: 44, carbon_offset_pct: 62, fine_risk_amount: 9200 },
  { ll97_emissions_pct: 47, energy_intensity_pct: 39, carbon_offset_pct: 70, fine_risk_amount: 4100 },
  { ll97_emissions_pct: 79, energy_intensity_pct: 63, carbon_offset_pct: 33, fine_risk_amount: 51000 },
  { ll97_emissions_pct: 22, energy_intensity_pct: 18, carbon_offset_pct: 88, fine_risk_amount: 0 },
]
buildingIds.forEach((id, i) => {
  insertCompliance.run({ building_id: id, snapshot_date: today, days_remaining: 60, deadline: '2026-05-01', ...complianceData[i] })
})

// ── Energy Readings (7 days per building) ──
const insertEnergy = db.prepare(`
  INSERT INTO energy_readings (building_id, reading_date, kwh_actual, kwh_limit, peak_demand_kw, previous_week_kw)
  VALUES (@building_id, @reading_date, @kwh_actual, @kwh_limit, @peak_demand_kw, @previous_week_kw)
`)
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const energyProfiles = [
  [820, 910, 875, 760, 930, 680, 847],  // 30 Hudson Yards
  [1200, 1350, 1280, 1100, 1400, 950, 1150], // One WTC
  [340, 390, 360, 310, 410, 280, 355],  // 432 Park
  [980, 1050, 1020, 890, 1100, 810, 970], // Empire State
  [620, 700, 665, 590, 740, 510, 640],  // One Vanderbilt
  [450, 520, 490, 410, 560, 380, 470],  // 111 Wall St
  [2100, 1800, 1600, 1400, 2400, 3800, 1200], // Yankee Stadium (game days spike)
  [1400, 1200, 1100, 1000, 1600, 2800, 800],  // Barclays Center
  [1800, 1900, 1850, 1700, 1950, 2100, 1600], // Queens Center Mall
  [120, 135, 128, 115, 140, 90, 110],   // Staten Island Borough Hall
]
buildingIds.forEach((id, bi) => {
  dayNames.forEach((day, i) => {
    const base = energyProfiles[bi][i]
    const variance = Math.round((Math.random() - 0.5) * base * 0.1)
    const kwh_actual = base + variance
    insertEnergy.run({
      building_id: id,
      reading_date: day,
      kwh_actual,
      kwh_limit: Math.round(base * 1.1),
      peak_demand_kw: kwh_actual,
      previous_week_kw: base - 30,
    })
  })
})

// ── Solar Readings ──
const insertSolar = db.prepare(`
  INSERT INTO solar_readings (building_id, reading_date, output_kw, output_kwh_today, co2_offset_tons, money_saved, capacity_pct, ac_score, e_score, h_score)
  VALUES (@building_id, @reading_date, @output_kw, @output_kwh_today, @co2_offset_tons, @money_saved, @capacity_pct, @ac_score, @e_score, @h_score)
`)
const solarProfiles = [
  { output_kw: 214, output_kwh_today: 1240, co2_offset_tons: 0.82, money_saved: 186, capacity_pct: 68, ac_score: 82, e_score: 74, h_score: 61 },
  { output_kw: 310, output_kwh_today: 1800, co2_offset_tons: 1.10, money_saved: 245, capacity_pct: 77, ac_score: 88, e_score: 80, h_score: 72 },
  { output_kw: 95,  output_kwh_today: 560,  co2_offset_tons: 0.38, money_saved: 72,  capacity_pct: 45, ac_score: 64, e_score: 58, h_score: 49 },
  { output_kw: 180, output_kwh_today: 1050, co2_offset_tons: 0.70, money_saved: 142, capacity_pct: 55, ac_score: 71, e_score: 66, h_score: 58 },
  { output_kw: 420, output_kwh_today: 2400, co2_offset_tons: 1.58, money_saved: 368, capacity_pct: 91, ac_score: 95, e_score: 89, h_score: 83 },
  { output_kw: 60,  output_kwh_today: 340,  co2_offset_tons: 0.22, money_saved: 48,  capacity_pct: 30, ac_score: 52, e_score: 44, h_score: 38 },
  { output_kw: 0,   output_kwh_today: 0,    co2_offset_tons: 0,    money_saved: 0,   capacity_pct: 0,  ac_score: 0,  e_score: 0,  h_score: 0  },
  { output_kw: 85,  output_kwh_today: 490,  co2_offset_tons: 0.32, money_saved: 62,  capacity_pct: 38, ac_score: 60, e_score: 55, h_score: 48 },
  { output_kw: 140, output_kwh_today: 810,  co2_offset_tons: 0.54, money_saved: 108, capacity_pct: 52, ac_score: 68, e_score: 62, h_score: 54 },
  { output_kw: 22,  output_kwh_today: 130,  co2_offset_tons: 0.09, money_saved: 18,  capacity_pct: 20, ac_score: 78, e_score: 72, h_score: 65 },
]
buildingIds.forEach((id, i) => {
  insertSolar.run({ building_id: id, reading_date: today, ...solarProfiles[i] })
})

// ── Alerts ──
const insertAlert = db.prepare(`
  INSERT INTO alerts (building_id, alert_type, severity, title, description, created_at)
  VALUES (@building_id, @alert_type, @severity, @title, @description, @created_at)
`)
const alertSets = [
  // 30 Hudson Yards
  [
    { alert_type: 'HVAC',     severity: 'critical', title: 'HVAC Overload – Floor 42',        description: 'Unit 42-A drawing 340% above baseline. Immediate inspection required.' },
    { alert_type: 'WATER',    severity: 'warning',  title: 'Water Pressure Anomaly – Floor 18', description: 'Pressure reading 18% below normal. Possible leak detected in riser.' },
    { alert_type: 'LIGHTING', severity: 'info',     title: 'Lights On After Hours – Floor 7',   description: 'Occupancy sensors show no motion but lighting remains active since 11 PM.' },
  ],
  // One WTC
  [
    { alert_type: 'LL97',     severity: 'critical', title: 'LL97 Penalty Risk – Q2 Deadline',   description: 'Projected emissions exceed 2026 cap by 12%. $18,500 fine risk if unresolved.' },
    { alert_type: 'HVAC',    severity: 'warning',  title: 'Chiller Efficiency Drop – B2',       description: 'Chiller unit B2 operating at 61% efficiency. Maintenance recommended.' },
  ],
  // 432 Park
  [
    { alert_type: 'LL97',     severity: 'critical', title: 'LL97 Threshold Exceeded',           description: 'Emissions at 88% of limit with 60 days remaining. $74,000 fine projected.' },
    { alert_type: 'HVAC',     severity: 'critical', title: 'HVAC Failure – Floors 80–96',       description: 'Three HVAC units offline on upper floors. Tenants reporting heat complaints.' },
    { alert_type: 'ENERGY',   severity: 'warning',  title: 'Peak Demand Spike – Weekday',       description: 'Energy use 23% above weekly average on Tuesday. Review floor 60-70 loads.' },
  ],
  // Empire State
  [
    { alert_type: 'LL97',     severity: 'critical', title: 'LL97 Critical – Fine Imminent',     description: 'At 95% of emissions limit. Projected $112,000 fine without immediate action.' },
    { alert_type: 'LIGHTING', severity: 'warning',  title: 'Observatory LED Retrofit Overdue',  description: 'Floors 86 and 102 still using legacy lighting. Retrofit saves est. $8,400/yr.' },
    { alert_type: 'HVAC',     severity: 'warning',  title: 'Steam Heating Inefficiency',        description: 'Legacy steam system on floors 1-20 running 31% over target energy use.' },
    { alert_type: 'WATER',    severity: 'info',     title: 'Water Usage Elevated – Floors 10-15', description: 'Usage 14% above baseline this week. Check fixtures on tenant floors.' },
  ],
  // One Vanderbilt
  [
    { alert_type: 'SOLAR',    severity: 'info',     title: 'Solar at Peak Output',              description: 'Rooftop array running at 91% capacity. Record output day this quarter.' },
  ],
  // 111 Wall St
  [
    { alert_type: 'LL97',     severity: 'critical', title: 'LL97 Cap Exceeded – Penalty Active', description: 'Emissions at 102% of limit. $187,000 fine already triggered for 2026.' },
    { alert_type: 'HVAC',     severity: 'critical', title: 'Cooling Tower Failure',             description: 'Rooftop cooling tower offline since Monday. Building running on backup units.' },
    { alert_type: 'ENERGY',   severity: 'critical', title: 'Energy Intensity Limit Breached',   description: 'kBtu/sqft exceeds LL97 threshold. Immediate load reduction required.' },
    { alert_type: 'WATER',    severity: 'warning',  title: 'Leak Detected – Basement Riser',    description: 'Flow sensor 3B showing continuous low-level flow. Plumber dispatched.' },
  ],
  // Yankee Stadium
  [
    { alert_type: 'ENERGY',   severity: 'warning',  title: 'Game-Day Peak Demand Spike',        description: 'Energy draw on event days averaging 3,800 kWh. Explore demand response program.' },
    { alert_type: 'LIGHTING', severity: 'info',     title: 'Field Lighting Scheduled Maintenance', description: 'LED array on field lights due for inspection. Schedule during off-season.' },
  ],
  // Barclays Center
  [
    { alert_type: 'HVAC',     severity: 'warning',  title: 'Arena HVAC Load – Event Nights',    description: 'HVAC draws 40% more on event nights. Pre-cooling protocol recommended.' },
    { alert_type: 'SOLAR',    severity: 'info',     title: 'Solar Output Below Forecast',       description: 'Array generating 12% below seasonal forecast. Panel cleaning scheduled.' },
  ],
  // Queens Center
  [
    { alert_type: 'LL97',     severity: 'critical', title: 'LL97 Fine Risk – $51,000',          description: 'Mall common areas and HVAC contributing to 79% emission threshold breach.' },
    { alert_type: 'LIGHTING', severity: 'warning',  title: 'Common Area Lighting 24/7',         description: 'Parking garage lights running overnight with no occupancy. Add motion sensors.' },
    { alert_type: 'ENERGY',   severity: 'warning',  title: 'Weekend Energy Peaks',              description: 'Saturday peak at 2,100 kWh. Anchor tenant HVAC contracts need renegotiation.' },
  ],
  // Staten Island Borough Hall
  [
    { alert_type: 'LIGHTING', severity: 'info',     title: 'LED Retrofit Complete',             description: 'All floors converted to LED. Estimated annual savings: $4,200.' },
  ],
]

buildingIds.forEach((id, i) => {
  alertSets[i].forEach(a => {
    insertAlert.run({ building_id: id, ...a, created_at: new Date().toISOString() })
  })
})

// ── Sensors ──
const insertSensor = db.prepare(`
  INSERT INTO sensors (building_id, sensor_type, status, last_heartbeat, location)
  VALUES (@building_id, @sensor_type, @status, @last_heartbeat, @location)
`)
const sensorSets = [
  // 30 Hudson Yards
  [
    { sensor_type: 'HVAC',         status: 'WARN',    location: 'Roof & Mechanical' },
    { sensor_type: 'Lighting',     status: 'ONLINE',  location: 'All Floors' },
    { sensor_type: 'Solar',        status: 'ONLINE',  location: 'Roof Array' },
    { sensor_type: 'Water',        status: 'ONLINE',  location: 'Risers & Basement' },
    { sensor_type: 'Backup Power', status: 'ONLINE',  location: 'Basement Level B2' },
  ],
  // One WTC
  [
    { sensor_type: 'HVAC',         status: 'WARN',    location: 'Floors 1–50 Mechanical' },
    { sensor_type: 'HVAC',         status: 'ONLINE',  location: 'Floors 51–104 Mechanical' },
    { sensor_type: 'Lighting',     status: 'ONLINE',  location: 'All Floors' },
    { sensor_type: 'Solar',        status: 'ONLINE',  location: 'Roof Array' },
    { sensor_type: 'Water',        status: 'ONLINE',  location: 'Risers' },
    { sensor_type: 'Backup Power', status: 'ONLINE',  location: 'Sub-Basement' },
  ],
  // 432 Park
  [
    { sensor_type: 'HVAC',         status: 'OFFLINE', location: 'Floors 80–96' },
    { sensor_type: 'HVAC',         status: 'WARN',    location: 'Floors 40–79' },
    { sensor_type: 'Lighting',     status: 'ONLINE',  location: 'All Floors' },
    { sensor_type: 'Solar',        status: 'ONLINE',  location: 'Roof Array' },
    { sensor_type: 'Water',        status: 'ONLINE',  location: 'Risers' },
  ],
  // Empire State
  [
    { sensor_type: 'HVAC',         status: 'WARN',    location: 'Floors 1–20 Steam System' },
    { sensor_type: 'Lighting',     status: 'WARN',    location: 'Observatory Floors 86 & 102' },
    { sensor_type: 'Solar',        status: 'ONLINE',  location: 'Roof Array' },
    { sensor_type: 'Water',        status: 'ONLINE',  location: 'Risers' },
    { sensor_type: 'Backup Power', status: 'ONLINE',  location: 'Sub-Basement' },
  ],
  // One Vanderbilt
  [
    { sensor_type: 'HVAC',         status: 'ONLINE',  location: 'All Mechanical Floors' },
    { sensor_type: 'Lighting',     status: 'ONLINE',  location: 'All Floors' },
    { sensor_type: 'Solar',        status: 'ONLINE',  location: 'Roof Array' },
    { sensor_type: 'Water',        status: 'ONLINE',  location: 'Risers' },
    { sensor_type: 'Backup Power', status: 'ONLINE',  location: 'Basement' },
  ],
  // 111 Wall St
  [
    { sensor_type: 'HVAC',         status: 'OFFLINE', location: 'Rooftop Cooling Tower' },
    { sensor_type: 'HVAC',         status: 'WARN',    location: 'Backup Cooling Units' },
    { sensor_type: 'Lighting',     status: 'ONLINE',  location: 'All Floors' },
    { sensor_type: 'Water',        status: 'WARN',    location: 'Basement Riser 3B' },
    { sensor_type: 'Backup Power', status: 'ONLINE',  location: 'Sub-Basement' },
  ],
  // Yankee Stadium
  [
    { sensor_type: 'HVAC',         status: 'ONLINE',  location: 'Concourse & Suites' },
    { sensor_type: 'Lighting',     status: 'ONLINE',  location: 'Field & Stands' },
    { sensor_type: 'Backup Power', status: 'ONLINE',  location: 'Electrical Room' },
  ],
  // Barclays
  [
    { sensor_type: 'HVAC',         status: 'WARN',    location: 'Arena Floor & Suites' },
    { sensor_type: 'Lighting',     status: 'ONLINE',  location: 'Arena & Concourse' },
    { sensor_type: 'Solar',        status: 'ONLINE',  location: 'Roof Array' },
    { sensor_type: 'Backup Power', status: 'ONLINE',  location: 'Electrical Room' },
  ],
  // Queens Center
  [
    { sensor_type: 'HVAC',         status: 'WARN',    location: 'Mall Common Areas' },
    { sensor_type: 'Lighting',     status: 'WARN',    location: 'Parking Garage' },
    { sensor_type: 'Water',        status: 'ONLINE',  location: 'Utility Risers' },
    { sensor_type: 'Backup Power', status: 'ONLINE',  location: 'Electrical Room' },
  ],
  // Staten Island Borough Hall
  [
    { sensor_type: 'HVAC',         status: 'ONLINE',  location: 'All Floors' },
    { sensor_type: 'Lighting',     status: 'ONLINE',  location: 'All Floors' },
    { sensor_type: 'Water',        status: 'ONLINE',  location: 'Risers' },
  ],
]
buildingIds.forEach((id, i) => {
  sensorSets[i].forEach(s => {
    insertSensor.run({ building_id: id, ...s, last_heartbeat: new Date().toISOString() })
  })
})

// ── Floors ──
const insertFloor = db.prepare(`
  INSERT INTO floors (building_id, floor_number, energy_status, occupancy_pct)
  VALUES (@building_id, @floor_number, @energy_status, @occupancy_pct)
`)
const floorProfiles = [
  { floors: 30, criticals: [6, 18],      elevated: [10, 23] },       // 30 Hudson Yards
  { floors: 30, criticals: [12, 25],     elevated: [8, 19, 27] },    // One WTC
  { floors: 30, criticals: [80, 88, 96], elevated: [60, 72] },       // 432 Park (uses top floors)
  { floors: 30, criticals: [14, 22],     elevated: [5, 18, 28] },    // Empire State
  { floors: 30, criticals: [],           elevated: [8] },             // One Vanderbilt (great shape)
  { floors: 30, criticals: [3, 11, 22],  elevated: [7, 16, 25] },   // 111 Wall (bad shape)
  { floors: 8,  criticals: [],           elevated: [3, 6] },          // Yankee Stadium
  { floors: 6,  criticals: [],           elevated: [2, 5] },          // Barclays
  { floors: 3,  criticals: [2],          elevated: [1] },             // Queens Center
  { floors: 5,  criticals: [],           elevated: [] },              // Staten Island
]
buildingIds.forEach((id, i) => {
  const { floors, criticals, elevated } = floorProfiles[i]
  for (let f = 1; f <= floors; f++) {
    const status = criticals.includes(f) ? 'critical' : elevated.includes(f) ? 'elevated' : 'normal'
    insertFloor.run({ building_id: id, floor_number: f, energy_status: status, occupancy_pct: Math.round(40 + Math.random() * 55) })
  }
})

// ── Users ──
const insertUser = db.prepare(`INSERT INTO users (name, email, initials, role) VALUES (@name, @email, @initials, @role)`)
const u1 = insertUser.run({ name: 'Michael Fehdrau', email: 'michael@greeneyesnyc.com', initials: 'MF', role: 'admin' })
const u2 = insertUser.run({ name: 'Sam Rivera',      email: 'sam@greeneyesnyc.com',     initials: 'SR', role: 'manager' })

const insertUB = db.prepare(`INSERT INTO user_buildings (user_id, building_id) VALUES (?, ?)`)
buildingIds.forEach(id => {
  insertUB.run(u1.lastInsertRowid, id)
  insertUB.run(u2.lastInsertRowid, id)
})

  console.log(`✅ Seed complete — ${buildings.length} buildings across all 5 boroughs loaded.`)
  saveDb()
})()
