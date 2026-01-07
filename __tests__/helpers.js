'use strict';

const registerMutation = require('../graphql/mutations/registerMutation');
const db = require('../models');

async function createUserWithRole(roleName) {
  const input = {
    email: `${roleName.toLowerCase()}_${Date.now()}@example.com`,
    password: 'Test123!',
    username: `${roleName.toLowerCase()}_${Date.now()}`,
    firstName: roleName,
    lastName: 'Test',
  };

  const result = await registerMutation.resolve(null, { input });
  const user = result.user || result;

  // find the role
  const role = await db.Role.findOne({ where: { name: roleName } });
  if (!role) {
    throw new Error(`Role ${roleName} not found in database`);
  }
  
  // get the actual user model instance
  const userInstance = await db.User.findByPk(user.userID);
  
  // use sequelize's built-in association method
  await userInstance.addRole(role);

  // reload user with roles
  const userWithRoles = await db.User.findByPk(user.userID, {
    include: [{ model: db.Role, as: 'roles' }]
  });
  
  // verify roles are loaded
  if (!userWithRoles.roles || userWithRoles.roles.length === 0) {
    throw new Error(`Failed to load roles for user ${userWithRoles.userID}`);
  }
  
  return userWithRoles;
}

async function createAdminUser() {
  return await createUserWithRole('Admin');
}

async function createManagerUser() {
  return await createUserWithRole('Manager');
}

async function createEmployeeUser() {
  return await createUserWithRole('Employee');
}

module.exports = {
  createAdminUser,
  createManagerUser,
  createEmployeeUser,
  createUserWithRole
};
