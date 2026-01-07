'use strict';
const db = require('../models');
const addRoleToUser = require('../graphql/mutations/addRoleToUserMutation');

jest.setTimeout(15000);

const adminCtx = { user: { userID: 0, roles: [{ name: 'Admin' }] } };

beforeAll(async () => {
  await db.Role.bulkCreate([
    { name: 'Admin' },
    { name: 'Employee' },
  ], { ignoreDuplicates: true });
});

afterAll(async () => {
  await db.UserRole.destroy({ where: {} });
  await db.User.destroy({ where: {} });
  await db.Role.destroy({ where: {} });
});

test('addRoleToUser happy and sad paths', async () => {
  const email = `ar_${Date.now()}@studybuddies.com`;
  const username = `u_${Date.now()}`;
  const user = await db.User.create({ email, password: 'x', username });

  // happy
  const added = await addRoleToUser.resolve(null, { username, roleName: 'Employee' }, adminCtx);
  expect(added).toBeDefined();
  const names = (added.roles || []).map(r => r.name);
  expect(names).toContain('Employee');

  // sad: adding same role
  await expect(addRoleToUser.resolve(null, { username, roleName: 'Employee' }, adminCtx)).rejects.toThrow('User already has this role');
});
