'use strict';
const userByUsernameQuery = require('../graphql/queries/userByUsernameQuery');
const db = require('../models');

jest.setTimeout(15000);

afterAll(async () => {
  await db.User.destroy({ where: {} });
});

test('userByUsername happy and sad paths', async () => {
  const email = `ub_${Date.now()}@studybuddies.com`;
  const username = `u_${Date.now()}`;
  const user = await db.User.create({ email, password: 'x', username });

  const ctx = { user: { roles: [{ name: 'Admin' }] } };
  const res = await userByUsernameQuery.resolve(null, { username }, ctx);
  expect(res).toBeDefined();

  await db.User.destroy({ where: { username } });
  await expect(userByUsernameQuery.resolve(null, { username }, ctx)).rejects.toThrow();
});
