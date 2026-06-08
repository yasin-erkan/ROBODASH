const {FLEET} = require('../fleet');
const {getFleet} = require('../database');

const getFleetHandler = async (_req, res) => {
  try {
    const rows = await getFleet();
    res.json(rows.length ? rows : FLEET);
  } catch {
    res.json(FLEET);
  }
};

module.exports = {getFleetHandler};
