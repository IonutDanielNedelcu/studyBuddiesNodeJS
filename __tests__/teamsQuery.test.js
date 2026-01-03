'use strict';
const teamsQuery = require('../graphql/queries/teamsQuery');
const db = require('../models');

jest.setTimeout(15000);

beforeAll(async () => {
  await db.Team.bulkCreate([
    { name: 'Alpha' },
    { name: 'Beta' },
  ], { ignoreDuplicates: true });
});

afterAll(async () => {
  await db.Team.destroy({ where: {} });
});

test('teamsQuery happy and sad paths', async () => {
  const ctx = { user: { roles: [{ name: 'Admin' }] } };
  const res = await teamsQuery.resolve(null, {}, ctx);
  expect(Array.isArray(res)).toBe(true);

  // clean and expect error
  await db.Team.destroy({ where: {} });
  await expect(teamsQuery.resolve(null, {}, ctx)).rejects.toThrow('No teams found');
});
