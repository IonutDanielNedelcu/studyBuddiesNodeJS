'use strict';
const db = require('../models');
const addPositionToUser = require('../graphql/mutations/addPositionToUserMutation');

jest.setTimeout(15000);

const adminCtx = { user: { userID: 0, roles: [{ name: 'Admin' }] } };

afterAll(async () => {
  await db.User.destroy({ where: {} });
  await db.Position.destroy({ where: {} });
});

test('addPositionToUser happy and sad paths', async () => {
  const email = `ap_${Date.now()}@studybuddies.com`;
  const username = `u_${Date.now()}`;
  const user = await db.User.create({ email, password: 'x', username });

  const pos = await db.Position.create({ name: 'Tester', seniority: 'Junior' });

  // happy
  const res = await addPositionToUser.resolve(null, { username, positionID: pos.positionID }, adminCtx);
  expect(res).toBeDefined();

  // sad: adding again
  await expect(addPositionToUser.resolve(null, { username, positionID: pos.positionID }, adminCtx)).rejects.toThrow();
});
