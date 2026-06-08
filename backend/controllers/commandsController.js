const {dispatchCommand} = require('../services/commandService');

const postCommand = async (req, res) => {
  const {robotId} = req.params;
  const {action} = req.body;
  const io = req.app.get('io');
  const deps = req.app.get('commandDeps')();

  const result = await dispatchCommand(io, {robotId, action}, {
    ...deps,
    userRole: req.user.role,
    issuedBy: req.user.username,
  });

  if (!result.ok) {
    const status = result.error === 'Forbidden' ? 403 : 400;
    return res.status(status).json(result);
  }

  res.json(result);
};

module.exports = {postCommand};
