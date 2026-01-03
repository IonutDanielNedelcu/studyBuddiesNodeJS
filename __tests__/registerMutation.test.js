'use strict';
const registerMutation = require('../graphql/mutations/registerMutation');
const db = require('../models');

jest.setTimeout(15000);

afterAll(async () => {
  await db.User.destroy({ where: {} });
});

test('registerMutation happy and sad paths', async () => {
  const input = {
    email: `reg_${Date.now()}@studybuddies.com`,
    password: 'password',
    username: `user_${Date.now()}`,
    firstName: 'Test',
    lastName: 'User'
  };

  const res = await registerMutation.resolve(null, { input }, {});
  expect(res).toBeDefined();

  // sad: missing fields
  await expect(registerMutation.resolve(null, { input: { email: '', password: '', username: '', firstName: '', lastName: '' } }, {})).rejects.toThrow();
});
