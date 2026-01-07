'use strict';

const createTeamMutation = require('../graphql/mutations/createTeamMutation');
const deleteTeamMutation = require('../graphql/mutations/deleteTeamMutation');
const changeUserTeamMutation = require('../graphql/mutations/changeUserTeamMutation');
const { createAdminUser } = require('./helpers');
const db = require('../models');

jest.setTimeout(15000);

test('createTeam with valid name (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const teamName = `test-team-${Date.now()}`;

  const result = await createTeamMutation.resolve(null, { name: teamName }, context);

  expect(result).toBeDefined();
  expect(result.teamID).toBeDefined();
  expect(result.name).toBe(teamName);
});

test('createTeam fails with duplicate name (sad path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const teamName = `duplicate-team-${Date.now()}`;

  await createTeamMutation.resolve(null, { name: teamName }, context);

  await expect(
    createTeamMutation.resolve(null, { name: teamName }, context)
  ).rejects.toThrow('Team already exists');
});

test('changeUserTeam assigns user to team (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const teamName = `user-team-${Date.now()}`;
  const team = await createTeamMutation.resolve(null, { name: teamName }, context);

  const result = await changeUserTeamMutation.resolve(null, { userID: user.userID, teamName }, context);

  expect(result).toBeDefined();
  expect(result.team).toBeDefined();
  expect(result.team.name).toBe(teamName);
  expect(result.team.teamID).toBe(team.teamID);
});

test('changeUserTeam fails with non-existent team (sad path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  await expect(
    changeUserTeamMutation.resolve(null, { userID: user.userID, teamName: 'NonExistentTeam' }, context)
  ).rejects.toThrow();
});

test('deleteTeam removes team (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const team = await createTeamMutation.resolve(null, { name: `delete-team-${Date.now()}` }, context);

  const result = await deleteTeamMutation.resolve(null, { teamID: team.teamID }, context);

  expect(result).toBe(true);

  const deleted = await db.Team.findByPk(team.teamID);
  expect(deleted).toBeNull();
});

test('deleteTeam requires authentication (sad path)', async () => {
  await expect(
    deleteTeamMutation.resolve(null, { teamID: 1 }, {})
  ).rejects.toThrow('Not authenticated');
});