'use strict';
const rolesQuery = require('../graphql/queries/rolesQuery');
const db = require('../models');

jest.setTimeout(15000);

beforeAll(async () => {
  await db.Role.bulkCreate([
    { name: 'Admin' },
    { name: 'Employee' },
  ], { ignoreDuplicates: true });
});

afterAll(async () => {
  await db.Role.destroy({ where: {} });
});

test('rolesQuery happy and sad paths', async () => {
  const ctx = { user: { roles: [{ name: 'Admin' }] } };
  const res = await rolesQuery.resolve(null, {}, ctx);
  expect(Array.isArray(res)).toBe(true);

  // clean and expect error
  await db.Role.destroy({ where: {} });
  await expect(rolesQuery.resolve(null, {}, ctx)).rejects.toThrow('No roles found');
});
