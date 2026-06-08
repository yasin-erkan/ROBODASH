const {saveSystemLog} = require('../database');

const pushLog = async (io, entry, broadcast = true) => {
  await saveSystemLog(entry);

  if (broadcast) {
    io.emit('system:log', {
      ...entry,
      created_at: new Date().toISOString(),
    });
  }
};

module.exports = {pushLog};
