'use strict';

const createRepositoryMutation = require('../graphql/mutations/createRepositoryMutation');
const registerMutation = require('../graphql/mutations/registerMutation');
const { createAdminUser } = require('./helpers');
const db = require('../models');

jest.setTimeout(15000);

test('createRepository with valid data (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const name = `test-repo-${Date.now()}`;
  const url = 'https://github.com/test/repo';

  const result = await createRepositoryMutation.resolve(null, { name, url }, context);

  expect(result).toBeDefined();
  expect(result.repositoryID).toBeDefined();
  expect(result.name).toBe(name);
  expect(result.url).toBe(url);
});

test('createRepository fails with duplicate name (sad path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const name = `duplicate-repo-${Date.now()}`;
  const url = 'https://github.com/test/duplicate';

  await createRepositoryMutation.resolve(null, { name, url }, context);

  await expect(
    createRepositoryMutation.resolve(null, { name, url }, context)
  ).rejects.toThrow('A repository with this name already exists');
});

test('createRepository requires authentication (sad path)', async () => {
  const name = `auth-test-repo-${Date.now()}`;
  const url = 'https://github.com/test/auth';

  await expect(
    createRepositoryMutation.resolve(null, { name, url }, {})
  ).rejects.toThrow('Not authenticated');
});

test('createRepository requires Admin or Manager role (sad path)', async () => {
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

  const name = `unauthorized-repo-${Date.now()}`;
  const url = 'https://github.com/test/unauthorized';

  await expect(
    createRepositoryMutation.resolve(null, { name, url }, context)
  ).rejects.toThrow('Not authorized');
});