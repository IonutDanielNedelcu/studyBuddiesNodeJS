// Jest setup: sync Sequelize (in-memory test DB) before tests
// Load environment variables from .env so tests use the same JWT secret
require('dotenv').config();
const db = require('../models');

beforeAll(async () => {
	await db.sequelize.sync({ force: true });
});

afterAll(async () => {
	await db.sequelize.close();
});

module.exports = {};
