'use strict';
const db = require('../models');
const removeRoleFromUser = require('../graphql/mutations/removeRoleFromUserMutation');

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

test('removeRoleFromUser happy and sad paths', async () => {
  const email = `rr_${Date.now()}@studybuddies.com`;
  const username = `u_${Date.now()}`;
  const user = await db.User.create({ email, password: 'x', username });

  // add role to then remove
  await db.Role.findOrCreate({ where: { name: 'Employee' } });
  await db.UserRole.create({ userID: user.userID, roleID: (await db.Role.findOne({ where: { name: 'Employee' } })).roleID });

  // happy
  const result = await removeRoleFromUser.resolve(null, { username, roleName: 'Employee' }, adminCtx);
  expect(result).toBeDefined();

  // sad: removing again
  await expect(removeRoleFromUser.resolve(null, { username, roleName: 'Employee' }, adminCtx)).rejects.toThrow('User does not have this role');
});
