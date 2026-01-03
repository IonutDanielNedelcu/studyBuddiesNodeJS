'use strict';
const db = require('../models');
const removePositionFromUser = require('../graphql/mutations/removePositionFromUserMutation');

jest.setTimeout(15000);

const adminCtx = { user: { userID: 0, roles: [{ name: 'Admin' }] } };

afterAll(async () => {
  await db.User.destroy({ where: {} });
  await db.Position.destroy({ where: {} });
});

test('removePositionFromUser happy and sad paths', async () => {
  const email = `rp_${Date.now()}@studybuddies.com`;
  const username = `u_${Date.now()}`;
  const user = await db.User.create({ email, password: 'x', username });

  const pos = await db.Position.create({ name: 'Dev', seniority: 'Senior' });
  // position is stored on the User via `positionID`
  await user.update({ positionID: pos.positionID });

  // happy
  const r = await removePositionFromUser.resolve(null, { username }, adminCtx);
  expect(r).toBeDefined();

  // sad: removing again
  await expect(removePositionFromUser.resolve(null, { username }, adminCtx)).rejects.toThrow('User has no position to remove');
});
