const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');

const FRONTEND_URL = process.env.FRONTEND_URL;

const createApp = () => {
  const app = express();
  app.use(
    cors(
      FRONTEND_URL
        ? {origin: FRONTEND_URL, credentials: true}
        : undefined,
    ),
  );
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
};

module.exports = {createApp};
