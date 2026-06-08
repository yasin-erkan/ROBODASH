const {ENABLE_SIMULATOR} = require('../config');

const getHealth = (_req, res) => {
  res.json({
    status: 'ok',
    service: 'RoboDash Backend',
    simulator: ENABLE_SIMULATOR,
  });
};

module.exports = {getHealth};
