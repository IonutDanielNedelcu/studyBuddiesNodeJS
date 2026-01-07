// Jest setup: sync Sequelize (in-memory test DB) before tests
// Load environment variables from .env so tests use the same JWT secret
require('dotenv').config();
const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../constants');

beforeAll(async () => {
	await db.sequelize.sync({ force: true });
	
	// seed roles for tests
	await db.Role.bulkCreate([
		{ name: 'Admin' },
		{ name: 'Manager' },
		{ name: 'Employee' }
	]);

	// create an admin user and expose admin context/token globally for tests
	const adminPassword = 'admin123';
	const hashed = await bcrypt.hash(adminPassword, 10);
	const adminUser = await db.User.create({
		email: 'jest_admin@studybuddies.com',
		password: hashed,
		username: 'jest_admin',
		firstName: 'Jest',
		lastName: 'Admin',
	});
	const adminRole = await db.Role.findOne({ where: { name: 'Admin' } });
	if (adminRole) {
		await db.UserRole.create({ userID: adminUser.userID, roleID: adminRole.roleID });
	}
	// reload user with roles
	const adminFull = await db.User.findByPk(adminUser.userID, { include: [{ model: db.Role, as: 'roles' }] });
	global.adminContext = { user: adminFull };
	const secret = JWT_SECRET_KEY || 'test-secret';
	const roleNames = (adminFull.roles || []).map(r => r.name);
	global.adminToken = jwt.sign({ sub: adminFull.userID, roles: roleNames }, secret, { expiresIn: '7d' });

	// Add a resolver wrapper that injects `global.adminContext` only when
	// the caller omitted the `context` argument (i.e. it's undefined).
	// We intentionally do NOT replace an explicit empty object `{}` so
	// tests that pass `{}` continue to exercise unauthenticated paths.
	const fs = require('fs');
	const path = require('path');

	function wrapResolversInDir(dir) {
		if (!fs.existsSync(dir)) return;
		for (const name of fs.readdirSync(dir)) {
			const full = path.join(dir, name);
			const stat = fs.statSync(full);
			if (stat.isDirectory()) {
				wrapResolversInDir(full);
			} else if (stat.isFile() && full.endsWith('.js')) {
				try {
					const mod = require(full);
					if (mod && typeof mod.resolve === 'function') {
						const orig = mod.resolve;
						mod.resolve = function(...args) {
							// If the caller didn't pass a context parameter at all,
							// inject the test admin context. Do NOT override explicit
							// `{}` or other objects.
							if (args.length < 3 || args[2] === undefined) args[2] = global.adminContext;
							return orig.apply(this, args);
						};
					}
				} catch (err) {
					// ignore require errors during setup
				}
			}
		}
	}

	const graphqlDir = path.join(__dirname, '..', 'graphql');
	wrapResolversInDir(path.join(graphqlDir, 'queries'));
	wrapResolversInDir(path.join(graphqlDir, 'mutations'));
});

// Do not close the Sequelize connection here because `setupFilesAfterEnv`
// runs once per test file; closing the connection in this file causes
// other test suites to fail when they attempt DB access. The test runner
// (Jest) will exit the process after all suites complete which will
// clean up resources.

module.exports = {};
