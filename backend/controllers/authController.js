const jwt = require('jsonwebtoken');
const {JWT_SECRET, USERS} = require('../config');

const login = (req, res) => {
  const {username, password} = req.body || {};

  const user = USERS.find(
    entry => entry.username === username && entry.password === password,
  );

  if (!user) {
    return res.status(401).json({error: 'Invalid credentials'});
  }

  const token = jwt.sign(
    {sub: user.username, username: user.username, role: user.role},
    JWT_SECRET,
    {expiresIn: '8h'},
  );

  res.json({
    token,
    user: {username: user.username, role: user.role},
  });
};

module.exports = {login};
