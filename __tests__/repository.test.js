'use strict';
const createRepositoryMutation = require('../graphql/mutations/createRepositoryMutation');
const db = require('../models');

// short helper to create Admin context
const getAdminContext = async () => {
  const [role] = await db.Role.findOrCreate({ where: { name: 'Admin' } });
  const user = await db.User.create({
    email: `admin_${Date.now()}@test.com`,
    username: `admin_${Date.now()}`,
    password: 'pass',
    firstName: 'A', lastName: 'T'
  });
  await user.addRole(role);
  // reload user with roles for authorization to work
  const userWithRoles = await db.User.findByPk(user.userID, { include: [{ model: db.Role, as: 'roles' }] });
  return { user: userWithRoles };
};

describe('Repository Tests', () => {
  test('Create Repository', async () => {
    const context = await getAdminContext();
    const args = { name: `repo-${Date.now()}`, url: 'http://git.com' };
    
    const res = await createRepositoryMutation.resolve(null, args, context);
    expect(res.name).toBe(args.name);
  });

  test('Prevent Duplicate Name', async () => {
    const context = await getAdminContext();
    const args = { name: `unique-${Date.now()}`, url: 'http://git.com' };
    
    await createRepositoryMutation.resolve(null, args, context);
    await expect(createRepositoryMutation.resolve(null, args, context))
      .rejects.toThrow('A repository with this name already exists');
  });
});