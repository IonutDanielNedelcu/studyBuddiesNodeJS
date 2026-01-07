'use strict';

const db = require('../models');
const addRoleToUser = require('../graphql/mutations/addRoleToUserMutation');
const removeRoleFromUser = require('../graphql/mutations/removeRoleFromUserMutation');
const createPosition = require('../graphql/mutations/createPositionMutation');
const addPositionToUser = require('../graphql/mutations/addPositionToUserMutation');
const removePositionFromUser = require('../graphql/mutations/removePositionFromUserMutation');
const removeUser = require('../graphql/mutations/removeUserMutation');
const removePosition = require('../graphql/mutations/removePositionMutation');

const rolesQuery = require('../graphql/queries/rolesQuery');
const usersQuery = require('../graphql/queries/usersQuery');
const positionsQuery = require('../graphql/queries/positionsQuery');
const positionsByName = require('../graphql/queries/positionsByNameQuery');
const positionsBySeniority = require('../graphql/queries/positionsBySeniorityQuery');
const teamsQuery = require('../graphql/queries/teamsQuery');
const teamByName = require('../graphql/queries/teamByNameQuery');
const userByUsername = require('../graphql/queries/userByUsernameQuery');

jest.setTimeout(20000);

// Helper context objects
const adminCtx = { user: { userID: 0, roles: [{ name: 'Admin' }] } };
const managerCtx = { user: { userID: 0, roles: [{ name: 'Manager' }] } };

beforeAll(async () => {
  // ensure roles that tests rely on exist
  await db.Role.bulkCreate([
    { name: 'Admin' },
    { name: 'Manager' },
    { name: 'Employee' },
  ], { ignoreDuplicates: true });
});

afterAll(async () => {
  // cleanup database between test runs
  await db.Role.destroy({ where: {} });
  await db.User.destroy({ where: {} });
  await db.Position.destroy({ where: {} });
  await db.Team.destroy({ where: {} });
});

test('addRoleToUser: happy and sad paths', async () => {
  const email = `ar_${Date.now()}@studybuddies.com`;
  const user = await db.User.create({ email, password: 'x', username: `u_${Date.now()}` });
  const role = await db.Role.findOne({ where: { name: 'Employee' } });

  // happy: add role
  const added = await addRoleToUser.resolve(null, { username: user.username, roleName: 'Employee' }, adminCtx);
  expect(added).toBeDefined();
  const names = (added.roles || []).map(r => r.name);
  expect(names).toContain('Employee');

  // sad: add the same role again -> error
  await expect(addRoleToUser.resolve(null, { username: user.username, roleName: 'Employee' }, adminCtx)).rejects.toThrow('User already has this role');
});

test('removeRoleFromUser: happy and sad paths', async () => {
  const email = `rr_${Date.now()}@studybuddies.com`;
  const username = `u_rr_${Date.now()}`;
  const user = await db.User.create({ email, password: 'x', username });
  const role = await db.Role.findOne({ where: { name: 'Employee' } });
  // assign role directly
  await db.UserRole.create({ userID: user.userID, roleID: role.roleID });

  // happy: remove role
  const after = await removeRoleFromUser.resolve(null, { username, roleName: 'Employee' }, adminCtx);
  expect(after).toBeDefined();
  const names = (after.roles || []).map(r => r.name);
  expect(names).not.toContain('Employee');

  // sad: remove again -> error
  await expect(removeRoleFromUser.resolve(null, { username, roleName: 'Employee' }, adminCtx)).rejects.toThrow('User does not have this role');
});

test('createPosition and removePosition: happy and sad', async () => {
  const name = `TestPosition_${Date.now()}`;
  const seniority = 'Senior';

  // happy: create
  const pos = await createPosition.resolve(null, { name, seniority }, adminCtx);
  expect(pos).toBeDefined();
  expect(pos.name).toBe(name);

  // sad: create same -> error
  await expect(createPosition.resolve(null, { name, seniority }, adminCtx)).rejects.toThrow(/already exists/);

  // happy: remove position
  const removed = await removePosition.resolve(null, { positionID: pos.positionID }, adminCtx);
  expect(removed.positionID).toBe(pos.positionID);

  // sad: remove again -> error
  await expect(removePosition.resolve(null, { positionID: pos.positionID }, adminCtx)).rejects.toThrow('Position not found');
});

test('addPositionToUser and removePositionFromUser: happy and sad', async () => {
  const username = `u_pos_${Date.now()}`;
  const email = `u_pos_${Date.now()}@studybuddies.com`;
  const user = await db.User.create({ email, password: 'x', username });

  const pos = await db.Position.create({ name: `P_${Date.now()}`, seniority: 'Junior' });

  // happy: add position
  const withPos = await addPositionToUser.resolve(null, { username, positionID: pos.positionID }, adminCtx);
  expect(withPos.position).toBeDefined();
  expect(withPos.position.positionID).toBe(pos.positionID);

  // sad: add same again
  await expect(addPositionToUser.resolve(null, { username, positionID: pos.positionID }, adminCtx)).rejects.toThrow('User already has this position');

  // happy: remove position
  const removed = await removePositionFromUser.resolve(null, { username }, adminCtx);
  expect(removed.position).toBeNull();

  // sad: remove again
  await expect(removePositionFromUser.resolve(null, { username }, adminCtx)).rejects.toThrow('User has no position to remove');
});

test('removeUser: happy and sad', async () => {
  const username = `u_del_${Date.now()}`;
  const email = `u_del_${Date.now()}@studybuddies.com`;
  const user = await db.User.create({ email, password: 'x', username });

  // happy
  const ok = await removeUser.resolve(null, { username }, adminCtx);
  expect(ok).toBe(true);

  // sad
  await expect(removeUser.resolve(null, { username }, adminCtx)).rejects.toThrow('User not found');
});

test('roles/users/positions/teams queries: happy and sad', async () => {
  // prepare entries
  await db.Team.create({ name: `Team_${Date.now()}` });
  await db.Position.create({ name: `PosQ_${Date.now()}`, seniority: 'Mid' });
  const u = await db.User.create({ email: `q_${Date.now()}@studybuddies.com`, password: 'x', username: `uq_${Date.now()}`, firstName: 'Q', lastName: 'User' });

  // rolesQuery (happy)
  const rs = await rolesQuery.resolve(null, {}, adminCtx);
  expect(Array.isArray(rs)).toBe(true);

  // usersQuery (happy)
  const us = await usersQuery.resolve(null, {}, adminCtx);
  expect(Array.isArray(us)).toBe(true);

  // positionsQuery (happy)
  const ps = await positionsQuery.resolve(null, {}, adminCtx);
  expect(Array.isArray(ps)).toBe(true);

  // positionsByName (happy)
  const pbn = await positionsByName.resolve(null, { name: ps[0].name }, adminCtx);
  expect(Array.isArray(pbn)).toBe(true);

  // positionsBySeniority (happy)
  const pbs = await positionsBySeniority.resolve(null, { seniority: ps[0].seniority }, adminCtx);
  expect(Array.isArray(pbs)).toBe(true);

  // teamsQuery (happy)
  const ts = await teamsQuery.resolve(null, {}, managerCtx);
  expect(Array.isArray(ts)).toBe(true);

  // teamByName (happy)
  const tbn = await teamByName.resolve(null, { name: ts[0].name }, managerCtx);
  expect(tbn.name).toBe(ts[0].name);

  // userByUsername (happy)
  const ub = await userByUsername.resolve(null, { username: u.username }, { user: { roles: [{ name: 'Employee' }] } });
  expect(ub.username).toBe(u.username);

  // now delete them to force sad paths
  await db.Role.destroy({ where: {} });
  await db.User.destroy({ where: {} });
  await db.Position.destroy({ where: {} });
  await db.Team.destroy({ where: {} });

  await expect(rolesQuery.resolve(null, {}, adminCtx)).rejects.toThrow('No roles found');
  await expect(usersQuery.resolve(null, {}, adminCtx)).rejects.toThrow('No users found');
  await expect(positionsQuery.resolve(null, {}, adminCtx)).rejects.toThrow('No positions found');
  await expect(positionsByName.resolve(null, { name: 'nothing' }, adminCtx)).rejects.toThrow(/No positions found/);
  await expect(positionsBySeniority.resolve(null, { seniority: 'nothing' }, adminCtx)).rejects.toThrow(/No positions found/);
  await expect(teamsQuery.resolve(null, {}, managerCtx)).rejects.toThrow('No teams found');
  await expect(teamByName.resolve(null, { name: 'nope' }, managerCtx)).rejects.toThrow(/Team not found/);
  await expect(userByUsername.resolve(null, { username: 'noone' }, { user: { roles: [{ name: 'Employee' }] } })).rejects.toThrow(/User not found/);
});
