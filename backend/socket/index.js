const {FLEET, COUNTRY_NAMES} = require('../fleet');
const {ROBOT_TOKEN} = require('../config');
const {verifyToken} = require('../middleware/auth');
const {publishTelemetry} = require('../services/telemetryService');

const socketAuth = (socket, next) => {
  const {token} = socket.handshake.query;

  if (token === ROBOT_TOKEN) {
    socket.data.role = 'robot';
    return next();
  }

  if (token) {
    try {
      const user = verifyToken(token);
      socket.data.role = 'dashboard';
      socket.data.userRole = user.role;
      socket.data.username = user.username;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  }

  next(new Error('Unauthorized'));
};

const registerSocketHandlers = (
  io,
  {pushLog, dispatchCommand, getCommandDeps},
) => {
  io.use(socketAuth);

  io.on('connection', socket => {
    if (socket.data.role === 'dashboard') {
      console.log('Dashboard connected:', socket.data.username, socket.id);
      pushLog({
        level: 'info',
        source: 'dashboard',
        message: `Dashboard connected: ${socket.data.username} (${socket.data.userRole})`,
      });
      socket.emit('fleet:init', {robots: FLEET, countries: COUNTRY_NAMES});

      socket.on('robot:command', async payload => {
        const result = await dispatchCommand(io, payload, {
          ...getCommandDeps(),
          userRole: socket.data.userRole,
          issuedBy: socket.data.username,
        });

        if (!result.ok) {
          socket.emit('command:ack', {...payload, ok: false, error: result.error});
        }
      });
      return;
    }

    const robotId = socket.handshake.query.robotId || socket.id;
    const {robotSockets} = getCommandDeps();
    console.log('Robot connected:', robotId);

    robotSockets.set(robotId, socket);

    pushLog({
      level: 'info',
      source: 'robot',
      robot_id: robotId,
      message: `Robot connected (${robotId})`,
    });

    socket.on('disconnect', () => {
      robotSockets.delete(robotId);
      pushLog({
        level: 'warn',
        source: 'robot',
        robot_id: robotId,
        message: `Robot disconnected (${robotId})`,
      });
    });

    socket.on('telemetry', raw => {
      publishTelemetry(io, {...raw, id: raw.id || robotId});
    });
  });
};

module.exports = {registerSocketHandlers};
