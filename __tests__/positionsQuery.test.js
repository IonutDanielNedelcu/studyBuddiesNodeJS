'use strict';
const positionsQuery = require('../graphql/queries/positionsQuery');
const db = require('../models');

jest.setTimeout(15000);

beforeAll(async () => {
  await db.Position.bulkCreate([
    { name: 'Dev', seniority: 'Senior' },
    { name: 'Tester', seniority: 'Junior' },
  ], { ignoreDuplicates: true });
});

afterAll(async () => {
  await db.Position.destroy({ where: {} });
});

test('positionsQuery happy and sad paths', async () => {
  const ctx = { user: { roles: [{ name: 'Admin' }] } };
  const res = await positionsQuery.resolve(null, {}, ctx);
  expect(Array.isArray(res)).toBe(true);

  // clean and expect error
  await db.Position.destroy({ where: {} });
  await expect(positionsQuery.resolve(null, {}, ctx)).rejects.toThrow('No positions found');
});
