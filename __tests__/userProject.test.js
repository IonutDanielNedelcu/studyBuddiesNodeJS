'use strict';
const addUserToProjectMutation = require('../graphql/mutations/addUserToProjectMutation');
const removeUserFromProjectMutation = require('../graphql/mutations/removeUserFromProjectMutation');
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

describe('User-Project Tests', () => {
  test('Assign and Remove User', async () => {
    const context = await getAdminContext();
    
    // setup: a project and another simple user
    const project = await db.Project.create({ name: `P-${Date.now()}` });
    const worker = await db.User.create({ 
      email: `w-${Date.now()}@t.com`, username: `w-${Date.now()}`, password: 'p', firstName: 'W', lastName: 'W' 
    });

    // 1. assign
    await addUserToProjectMutation.resolve(null, { projectID: project.projectID, userID: worker.userID }, context);
    
    const checkDb = await db.UserProject.findOne({ where: { projectID: project.projectID, userID: worker.userID } });
    expect(checkDb).not.toBeNull();

    // 2. remove
    await removeUserFromProjectMutation.resolve(null, { projectID: project.projectID, userID: worker.userID }, context);
    
    const checkDb2 = await db.UserProject.findOne({ where: { projectID: project.projectID, userID: worker.userID } });
    expect(checkDb2).toBeNull();
  });
});