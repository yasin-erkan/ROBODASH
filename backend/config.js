const PORT = Number(process.env.PORT) || 3000;
const ROBOT_TOKEN = process.env.ROBOT_TOKEN || 'robot-secret-key';
const ENABLE_SIMULATOR = process.env.ENABLE_SIMULATOR !== 'false';
const JWT_SECRET = process.env.JWT_SECRET || 'robodash-dev-secret';

const USERS = [
  {username: 'admin', password: 'admin123', role: 'admin'},
  {username: 'operator', password: 'op123', role: 'operator'},
  {username: 'viewer', password: 'view123', role: 'viewer'},
];

module.exports = {PORT, ROBOT_TOKEN, ENABLE_SIMULATOR, JWT_SECRET, USERS};
