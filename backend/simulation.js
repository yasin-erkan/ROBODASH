/**
 * Fleet simulation engine — started by server.js on boot.
 * Production: replace with real robots or a ROS bridge emitting the same telemetry payload.
 */
const {FLEET} = require('./fleet');

const fleetById = Object.fromEntries(FLEET.map(robot => [robot.id, robot]));

const INTERVAL_MS = Number(process.env.SIM_INTERVAL_MS) || 5000;

const THRESHOLDS = {
  batteryLow: 20,
  batteryFull: 95,
  waterLow: 15,
  waterRefilled: 85,
};

const createRobots = () =>
  FLEET.map((robot, i) => ({
    ...robot,
    battery: 75 + (i % 3) * 8,
    water_level: 70 + (i % 4) * 6,
    panels_cleaned: i * 40,
    status: 'idle',
    idleTicks: i * 3,
    errorTicks: 0,
    cleanTicks: 0,
    cleaningTarget: 60 + (i % 3) * 20,
    panelsAtJobStart: i * 40,
  }));

const idleDelay = robot => 18 + (robot.id.charCodeAt(robot.id.length - 1) % 12);

const applyStateTransition = robot => {
  if (robot.status === 'error') {
    robot.errorTicks += 1;
    if (robot.errorTicks >= 20) {
      robot.water_level = THRESHOLDS.waterRefilled;
      robot.status = 'idle';
      robot.errorTicks = 0;
      robot.idleTicks = 0;
    }
    return;
  }

  if (robot.status === 'charging') {
    robot.battery = Math.min(100, robot.battery + 0.6);
    if (robot.battery >= THRESHOLDS.batteryFull) {
      robot.status = 'idle';
      robot.idleTicks = 0;
    }
    return;
  }

  if (robot.status === 'cleaning') {
    robot.cleanTicks += 1;
    robot.battery = Math.max(5, robot.battery - 0.12);
    robot.water_level = Math.max(0, robot.water_level - 0.18);

    if (robot.cleanTicks % 2 === 0) {
      robot.panels_cleaned += 1;
    }

    robot.lat += (Math.random() - 0.5) * 0.00006;
    robot.lng += (Math.random() - 0.5) * 0.00006;

    if (robot.water_level < THRESHOLDS.waterLow) {
      robot.status = 'error';
      robot.errorTicks = 0;
      robot.cleanTicks = 0;
      return;
    }
    if (robot.battery < THRESHOLDS.batteryLow) {
      robot.status = 'charging';
      robot.cleanTicks = 0;
      return;
    }
    if (robot.panels_cleaned - robot.panelsAtJobStart >= robot.cleaningTarget) {
      robot.status = 'idle';
      robot.idleTicks = 0;
      robot.cleanTicks = 0;
    }
    return;
  }

  robot.idleTicks += 1;
  if (robot.idleTicks >= idleDelay(robot)) {
    robot.status = 'cleaning';
    robot.panelsAtJobStart = robot.panels_cleaned;
    robot.cleaningTarget = 50 + Math.floor(Math.random() * 40);
    robot.cleanTicks = 0;
  }
};

const applyCommand = (robot, action) => {
  switch (action) {
    case 'start_clean':
      if (robot.status !== 'idle' && robot.status !== 'charging') return false;
      robot.status = 'cleaning';
      robot.panelsAtJobStart = robot.panels_cleaned;
      robot.cleaningTarget = 50 + Math.floor(Math.random() * 40);
      robot.cleanTicks = 0;
      robot.idleTicks = 0;
      return true;

    case 'stop':
      if (robot.status !== 'cleaning') return false;
      robot.status = 'idle';
      robot.idleTicks = 0;
      robot.cleanTicks = 0;
      return true;

    case 'return_home': {
      if (robot.status === 'error') return false;
      const base = fleetById[robot.id];
      if (base) {
        robot.lat = base.lat;
        robot.lng = base.lng;
      }
      robot.status = 'idle';
      robot.idleTicks = 0;
      robot.cleanTicks = 0;
      return true;
    }

    default:
      return false;
  }
};

const tickRobots = robots => {
  robots.forEach(robot => applyStateTransition(robot));
  return robots.map(
    ({idleTicks, errorTicks, cleanTicks, cleaningTarget, panelsAtJobStart, ...telemetry}) => ({
      ...telemetry,
    }),
  );
};

const startFleetSimulation = (onTelemetry, {onStatusChange} = {}) => {
  const robots = createRobots();
  let lastStatuses = Object.fromEntries(robots.map(r => [r.id, r.status]));

  const tick = () => {
    tickRobots(robots);

    robots.forEach(robot => {
      if (robot.status !== lastStatuses[robot.id]) {
        onStatusChange?.(robot, lastStatuses[robot.id]);
        lastStatuses[robot.id] = robot.status;
      }
      onTelemetry({...robot});
    });
  };

  tick();
  const timer = setInterval(tick, INTERVAL_MS);

  console.log(
    `[SIM] Fleet simulation active (${robots.length} robots, every ${INTERVAL_MS / 1000}s)`,
  );

  return {
    stop: () => clearInterval(timer),
    applyCommand: (robotId, action) => {
      const robot = robots.find(r => r.id === robotId);
      if (!robot) return false;
      return applyCommand(robot, action);
    },
  };
};

module.exports = {
  INTERVAL_MS,
  THRESHOLDS,
  createRobots,
  applyCommand,
  tickRobots,
  startFleetSimulation,
};
