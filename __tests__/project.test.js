'use strict';
const createProjectMutation = require('../graphql/mutations/createProjectMutation');
const deleteProjectMutation = require('../graphql/mutations/deleteProjectMutation');
const db = require('../models');

// short helper to create Admin context
const getAdminContext = async () => {
  const [role] = await db.Role.findOrCreate({ where: { name: 'Admin' } });
  const user = await db.User.create({
    email: `admin_${Date.now()}@test.com`,
    username: `admin_${Date.now()}`,
    password: 'pass', firstName: 'A', lastName: 'T'
  });
  await user.addRole(role);
  // reload user with roles for authorization to work
  const userWithRoles = await db.User.findByPk(user.userID, { include: [{ model: db.Role, as: 'roles' }] });
  return { user: userWithRoles };
};

describe('Project Tests', () => {
  test('Create Project with Repository', async () => {
    const context = await getAdminContext();
    // create a repo directly in DB
    const repo = await db.Repository.create({ name: `repo-${Date.now()}`, url: 'http://test.com' });

    const project = await createProjectMutation.resolve(null, {
      name: `Proj-${Date.now()}`,
      description: 'Test',
      repositoryID: repo.repositoryID
    }, context);

    expect(project.repositoryID).toBe(repo.repositoryID);
  });

  test('Delete Project', async () => {
    const context = await getAdminContext();
    const project = await createProjectMutation.resolve(null, { name: `Del-${Date.now()}` }, context);
    
    const res = await deleteProjectMutation.resolve(null, { projectID: project.projectID }, context);
    expect(res).toBe(true);
  });

  test('Fail invalid Repository ID', async () => {
    const context = await getAdminContext();
    await expect(createProjectMutation.resolve(null, { name: 'Fail', repositoryID: 9999 }, context))
      .rejects.toThrow('Repository ID not found');
  });
});