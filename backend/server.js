const http = require('http');
const {Server} = require('socket.io');
const {createApp} = require('./app');
const {PORT, ENABLE_SIMULATOR} = require('./config');
const {pushLog} = require('./services/logService');
const {publishTelemetry} = require('./services/telemetryService');
const {dispatchCommand} = require('./services/commandService');
const {registerSocketHandlers} = require('./socket');
const {startFleetSimulation} = require('./simulation');

const app = createApp();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL;
const io = new Server(server, {
  cors: FRONTEND_URL ? {origin: FRONTEND_URL} : {origin: '*'},
});

const robotSockets = new Map();
const log = entry => pushLog(io, entry);
const broadcastTelemetry = raw => publishTelemetry(io, raw);

let simApply;

const getCommandDeps = () => ({
  pushLog: log,
  simApply,
  robotSockets,
});

app.set('io', io);
app.set('commandDeps', getCommandDeps);

registerSocketHandlers(io, {pushLog: log, dispatchCommand, getCommandDeps});

server.listen(PORT, async () => {
  console.log(`RoboDash Backend is running on port ${PORT}`);
  await log({level: 'info', source: 'server', message: 'RoboDash backend started'});

  if (ENABLE_SIMULATOR) {
    const sim = startFleetSimulation(broadcastTelemetry, {
      onStatusChange: (robot, previousStatus) => {
        log({
          level: robot.status === 'error' ? 'warn' : 'info',
          source: 'server',
          robot_id: robot.id,
          message: `${robot.id}: ${previousStatus} → ${robot.status}`,
        });
      },
    });
    simApply = sim.applyCommand;
  }
});
