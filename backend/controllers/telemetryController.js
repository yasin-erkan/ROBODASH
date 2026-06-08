const {getTelemetryHistory} = require('../database');

const getHistory = async (req, res) => {
  try {
    const rows = await getTelemetryHistory({
      limit: req.query.limit,
      robotId: req.query.robot_id,
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({error: 'DB Error', detail: err.message});
  }
};

module.exports = {getHistory};
