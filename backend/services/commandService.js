const VALID_ACTIONS = ['start_clean', 'stop', 'return_home'];
const ROLES_CAN_COMMAND = ['operator', 'admin'];

const ACTION_LABELS = {
  start_clean: 'Start clean',
  stop: 'Stop',
  return_home: 'Return home',
};

const dispatchCommand = async (
  io,
  {robotId, action},
  {pushLog, simApply, robotSockets, userRole, issuedBy} = {},
) => {
  if (!robotId || !VALID_ACTIONS.includes(action)) {
    return {ok: false, error: 'Invalid command'};
  }

  if (userRole && !ROLES_CAN_COMMAND.includes(userRole)) {
    return {ok: false, error: 'Forbidden'};
  }

  const simApplied = simApply?.(robotId, action) ?? false;
  const robotSocket = robotSockets?.get(robotId);

  if (robotSocket) {
    robotSocket.emit('command', {action});
  }

  if (!simApplied && !robotSocket) {
    return {ok: false, error: 'Robot not available'};
  }

  await pushLog({
    level: 'info',
    source: 'dashboard',
    robot_id: robotId,
    message: `Command: ${ACTION_LABELS[action]}${issuedBy ? ` (${issuedBy})` : ''}`,
  });

  io.emit('command:ack', {robotId, action, ok: true});
  return {ok: true, robotId, action};
};

module.exports = {VALID_ACTIONS, ACTION_LABELS, ROLES_CAN_COMMAND, dispatchCommand};
