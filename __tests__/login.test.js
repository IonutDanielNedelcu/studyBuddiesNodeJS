'use strict';

const registerMutation = require('../graphql/mutations/registerMutation');
const loginMutation = require('../graphql/mutations/loginMutation');

jest.setTimeout(15000);

test('login successful for existing user', async () => {
  const password = 'secret123';
  const input = {
    email: `jest_login_${Date.now()}@example.com`,
    password,
    username: null,
    firstName: 'Jest',
    lastName: 'Login',
  };

  // create the user via register mutation (returns auth payload)
  await registerMutation.resolve(null, { input });

  const result = await loginMutation.resolve(null, { input: { email: input.email, password } });
  expect(result).toBeDefined();
  expect(result.token).toBeDefined();
  expect(result.user).toBeDefined();
  expect(result.user.email).toBe(input.email);
});

test('login fails with invalid credentials', async () => {
  const password = 'secret123';
  const input = {
    email: `jest_login_fail_${Date.now()}@example.com`,
    password,
    username: null,
    firstName: 'Jest',
    lastName: 'Fail',
  };

  await registerMutation.resolve(null, { input });

  await expect(
    loginMutation.resolve(null, { input: { email: input.email, password: 'wrongpassword' } })
  ).rejects.toThrow('Invalid credentials');
});
