'use strict';
const db = require('../models');
const removePositionMutation = require('../graphql/mutations/removePositionMutation');

jest.setTimeout(15000);

const adminCtx = { user: { userID: 0, roles: [{ name: 'Admin' }] } };

afterAll(async () => {
  await db.Position.destroy({ where: {} });
});

test('removePosition happy and sad paths', async () => {
  const pos = await db.Position.create({ name: `ToDelete_${Date.now()}`, seniority: 'Mid' });
  // happy
  const r = await removePositionMutation.resolve(null, { positionID: pos.positionID }, adminCtx);
  expect(r).toBeDefined();

  // sad: deleting again
  await expect(removePositionMutation.resolve(null, { positionID: pos.positionID }, adminCtx)).rejects.toThrow();
});
