'use strict';

const repositoriesQuery = require('../graphql/queries/repositoriesQuery');
const repositoryByNameQuery = require('../graphql/queries/repositoryByNameQuery');
const registerMutation = require('../graphql/mutations/registerMutation');
const { createAdminUser } = require('./helpers');
const db = require('../models');

jest.setTimeout(15000);

test('repositories query returns all repositories (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  await db.Repository.create({ name: `repo1-${Date.now()}`, url: 'https://github.com/test/repo1' });
  await db.Repository.create({ name: `repo2-${Date.now()}`, url: 'https://github.com/test/repo2' });

  const result = await repositoriesQuery.resolve(null, {}, context);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThanOrEqual(2);
});

test('repositories query requires authentication (sad path)', async () => {
  await expect(
    repositoriesQuery.resolve(null, {}, {})
  ).rejects.toThrow('Not authenticated');
});

test('repositories query requires Admin or Manager role (sad path)', async () => {
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

  await expect(
    repositoriesQuery.resolve(null, {}, context)
  ).rejects.toThrow('Not authorized');
});

test('repositoryByName query finds repository (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const name = `unique-repo-${Date.now()}`;
  await db.Repository.create({ name, url: 'https://github.com/test/unique' });

  const result = await repositoryByNameQuery.resolve(null, { name }, context);

  expect(result).toBeDefined();
  expect(result.name).toBe(name);
});

test('repositoryByName query returns null for non-existent repository (sad path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const result = await repositoryByNameQuery.resolve(null, { name: 'non-existent-repo' }, context);

  expect(result).toBeNull();
});
