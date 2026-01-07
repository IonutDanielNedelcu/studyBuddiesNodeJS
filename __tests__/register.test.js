'use strict';

const registerMutation = require('../graphql/mutations/registerMutation');

jest.setTimeout(15000);

test('register without positionID', async () => {
  const input = {
    email: `jest_user_${Date.now()}@example.com`,
    password: 'secret123',
    username: `user_${Date.now()}`,
    firstName: 'Jest',
    lastName: 'User',
    // positionID intentionally omitted
  };

  const result = await registerMutation.resolve(null, { input });
  expect(result).toBeDefined();
  // register now may return an auth payload { token, user }
  const user = result.user || result;
  expect(user.email).toBe(input.email);
  expect(user.firstName).toBe(input.firstName);
  expect(user.lastName).toBe(input.lastName);
  expect(user.positionID).toBeNull();
});
