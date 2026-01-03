// Jest setup: sync Sequelize (in-memory test DB) before tests
// Load environment variables from .env so tests use the same JWT secret
require('dotenv').config();
const db = require('../models');

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

// Do not close the shared Sequelize connection here because Jest may run files
// in separate workers and closing the connection from this global setup
// can cause "connection manager was closed" errors in other tests.
// The test runner will exit and release resources when finished.

module.exports = {};
