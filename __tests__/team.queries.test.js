'use strict';

const teamsQuery = require('../graphql/queries/teamsQuery');
const teamByNameQuery = require('../graphql/queries/teamByNameQuery');
const createTeamMutation = require('../graphql/mutations/createTeamMutation');
const registerMutation = require('../graphql/mutations/registerMutation');
const { createAdminUser } = require('./helpers');
const db = require('../models');

jest.setTimeout(15000);

test('teams query returns all teams (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  await createTeamMutation.resolve(null, { input: { name: `team1-${Date.now()}` } }, context);
  await createTeamMutation.resolve(null, { input: { name: `team2-${Date.now()}` } }, context);

  const result = await teamsQuery.resolve(null, {}, context);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThanOrEqual(2);
});

test('teams query requires authentication (sad path)', async () => {
  await expect(
    teamsQuery.resolve(null, {}, {})
  ).rejects.toThrow('Not authenticated');
});

test('teams query requires Admin or Manager role (sad path)', async () => {
  const input = {
    email: `employee_${Date.now()}@example.com`,
    password: 'Employee123!',
    username: `employee_${Date.now()}`,
    firstName: 'Employee',
    lastName: 'Test',
  };

  const result = await registerMutation.resolve(null, { input });
  const user = result.user || result;
  const context = { user };

  await expect(
    teamsQuery.resolve(null, {}, context)
  ).rejects.toThrow('Not authorized');
});

test('teamByName query finds team (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const teamName = `unique-team-${Date.now()}`;
  await createTeamMutation.resolve(null, { input: { name: teamName } }, context);

  const result = await teamByNameQuery.resolve(null, { name: teamName }, context);

  expect(result).toBeDefined();
  expect(result.name).toBe(teamName);
});

test('teamByName query returns null for non-existent team (sad path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const result = await teamByNameQuery.resolve(null, { name: 'NonExistentTeam' }, context);

  expect(result).toBeNull();
});
