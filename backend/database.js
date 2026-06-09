const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'robodash',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const saveTelemetry = async data => {
  const query = `
    INSERT INTO telemetry_data
      (robot_id, country, site, battery_level, water_level, panels_cleaned, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await pool.query(query, [
      data.id,
      data.country || null,
      data.site || null,
      data.battery,
      data.water_level ?? 100,
      data.panels_cleaned ?? 0,
      data.lat,
      data.lng,
      data.status,
    ]);
  } catch (err) {
    console.error('DB telemetry error:', err.message);
    await saveSystemLog({
      level: 'error',
      source: 'database',
      robot_id: data.id,
      message: `Telemetry save failed: ${err.message}`,
    });
  }
};

const saveSystemLog = async ({
  level = 'info',
  source = 'server',
  robot_id = null,
  message,
}) => {
  const query =
    'INSERT INTO system_logs (level, source, robot_id, message) VALUES (?, ?, ?, ?)';

  try {
    await pool.query(query, [level, source, robot_id, message]);
  } catch (err) {
    console.error('DB log error:', err.message);
  }
};

const getTelemetryHistory = async ({limit = 50, robotId = null} = {}) => {
  const safeLimit = Math.min(Number(limit) || 50, 200);

  if (robotId) {
    const [rows] = await pool.query(
      `SELECT id, robot_id, country, site, battery_level, water_level, panels_cleaned,
              latitude, longitude, status, created_at
       FROM telemetry_data
       WHERE robot_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [robotId, safeLimit],
    );
    return rows;
  }

  const [rows] = await pool.query(
    `SELECT id, robot_id, country, site, battery_level, water_level, panels_cleaned,
            latitude, longitude, status, created_at
     FROM telemetry_data
     ORDER BY created_at DESC
     LIMIT ?`,
    [safeLimit],
  );
  return rows;
};

const getSystemLogs = async ({limit = 50, level = null} = {}) => {
  const safeLimit = Math.min(Number(limit) || 50, 200);

  if (level) {
    const [rows] = await pool.query(
      `SELECT id, level, source, robot_id, message, created_at
       FROM system_logs
       WHERE level = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [level, safeLimit],
    );
    return rows;
  }

  const [rows] = await pool.query(
    `SELECT id, level, source, robot_id, message, created_at
     FROM system_logs
     ORDER BY created_at DESC
     LIMIT ?`,
    [safeLimit],
  );
  return rows;
};

const getFleet = async () => {
  const [rows] = await pool.query(
    'SELECT robot_id AS id, country, site, latitude AS lat, longitude AS lng FROM robots ORDER BY robot_id',
  );
  return rows;
};

module.exports = {
  pool,
  saveTelemetry,
  saveSystemLog,
  getTelemetryHistory,
  getSystemLogs,
  getFleet,
};
