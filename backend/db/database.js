const path = require('path')
const fs = require('fs')

const DB_PATH = path.join(__dirname, 'greeneyes.sqlite')

let SQL = null
let db = null
let initDone = false

function toSqlJsParams(obj) {
  if (obj === undefined || obj === null) return []
  if (Array.isArray(obj)) return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    out[':' + k.replace(/^@/, '')] = v
  }
  return out
}

function toSqlJsSql(sql) {
  return sql.replace(/@(\w+)/g, ':$1')
}

function wrapDb(nativeDb) {
  return {
    exec(sql) {
      nativeDb.run(sql)
    },
    prepare(sql) {
      const sqlJsSql = toSqlJsSql(sql)
      return {
        all(...args) {
          const params = args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]) ? toSqlJsParams(args[0]) : args
          const stmt = nativeDb.prepare(sqlJsSql)
          stmt.bind(params)
          const rows = []
          while (stmt.step()) rows.push(stmt.getAsObject())
          stmt.free()
          return rows
        },
        get(...args) {
          const params = args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]) ? toSqlJsParams(args[0]) : args
          const stmt = nativeDb.prepare(sqlJsSql)
          stmt.bind(params)
          const row = stmt.step() ? stmt.getAsObject() : null
          stmt.free()
          return row
        },
        run(...args) {
          const params = args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]) ? toSqlJsParams(args[0]) : args
          const stmt = nativeDb.prepare(sqlJsSql)
          stmt.bind(params)
          stmt.step()
          stmt.free()
          const lastId = nativeDb.exec('SELECT last_insert_rowid() as id')
          const lastInsertRowid = lastId.length && lastId[0].values[0] ? lastId[0].values[0][0] : 0
          return { lastInsertRowid }
        },
      }
    },
  }
}

async function initDb() {
  if (initDone) return
  const initSqlJs = require('sql.js')
  SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file),
  })
  let data = null
  if (fs.existsSync(DB_PATH)) {
    data = fs.readFileSync(DB_PATH)
  }
  db = data ? new SQL.Database(data) : new SQL.Database()
  initSchema()
  initDone = true
  return wrapDb(db)
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      borough TEXT,
      year_built INTEGER,
      floors INTEGER,
      gross_sq_ft INTEGER,
      owner TEXT
    );

    CREATE TABLE IF NOT EXISTS ll97_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      carbon_limit REAL,
      energy_limit REAL,
      fine_per_ton REAL,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS compliance_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      snapshot_date TEXT,
      ll97_emissions_pct REAL,
      energy_intensity_pct REAL,
      carbon_offset_pct REAL,
      fine_risk_amount REAL,
      days_remaining INTEGER,
      deadline TEXT,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS energy_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      reading_date TEXT NOT NULL,
      kwh_actual REAL,
      kwh_limit REAL,
      peak_demand_kw REAL,
      previous_week_kw REAL,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS solar_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      reading_date TEXT NOT NULL,
      output_kw REAL,
      output_kwh_today REAL,
      co2_offset_tons REAL,
      money_saved REAL,
      capacity_pct REAL,
      ac_score REAL,
      e_score REAL,
      h_score REAL,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      alert_type TEXT,
      severity TEXT,
      title TEXT,
      description TEXT,
      created_at TEXT,
      resolved_at TEXT,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS sensors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      sensor_type TEXT,
      status TEXT DEFAULT 'ONLINE',
      last_heartbeat TEXT,
      location TEXT,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS floors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      floor_number INTEGER,
      energy_status TEXT DEFAULT 'normal',
      occupancy_pct REAL,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      initials TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS user_buildings (
      user_id INTEGER NOT NULL,
      building_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, building_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    );
  `)
}

function getDB() {
  if (!initDone) throw new Error('Database not initialized. Call initDb() first (await in server/seed).')
  return wrapDb(db)
}

function saveDb() {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)
}

module.exports = { initDb, getDB, saveDb }
