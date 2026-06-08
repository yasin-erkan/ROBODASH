const {FLEET} = require('../fleet');
const {saveTelemetry} = require('../database');

const fleetById = Object.fromEntries(FLEET.map(robot => [robot.id, robot]));

const normalizeTelemetry = data => {
  const fleetRobot = fleetById[data.id || data.robot_id] || {};

  return {
    id: data.id || data.robot_id,
    country: data.country || fleetRobot.country,
    site: data.site || fleetRobot.site,
    lat: Number(data.lat ?? data.latitude ?? fleetRobot.lat),
    lng: Number(data.lng ?? data.longitude ?? fleetRobot.lng),
    battery: Number(data.battery ?? data.battery_level ?? 0),
    status: data.status || 'idle',
    water_level: Number(data.water_level ?? 100),
    panels_cleaned: Number(data.panels_cleaned ?? 0),
    updatedAt: new Date().toISOString(),
  };
};

const publishTelemetry = (io, raw) => {
  const data = normalizeTelemetry(raw);
  saveTelemetry(data);
  io.emit('telemetry', data);
  return data;
};

module.exports = {normalizeTelemetry, publishTelemetry};
