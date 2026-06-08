const {getSystemLogs} = require('../database');

const getLogs = async (req, res) => {
  try {
    const rows = await getSystemLogs({
      limit: req.query.limit,
      level: req.query.level,
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({error: 'DB Error', detail: err.message});
  }
};

module.exports = {getLogs};
