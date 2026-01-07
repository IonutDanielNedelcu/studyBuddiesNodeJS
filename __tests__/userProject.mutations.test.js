'use strict';

const addUserToProjectMutation = require('../graphql/mutations/addUserToProjectMutation');
const removeUserFromProjectMutation = require('../graphql/mutations/removeUserFromProjectMutation');
const createProjectMutation = require('../graphql/mutations/createProjectMutation');
const registerMutation = require('../graphql/mutations/registerMutation');
const { createAdminUser } = require('./helpers');
const db = require('../models');

jest.setTimeout(15000);

async function createRegularUser() {
  const input = {
    email: `user_${Date.now()}@example.com`,
    password: 'User123!',
    username: `user_${Date.now()}`,
    firstName: 'Regular',
    lastName: 'User',
  };

  const result = await registerMutation.resolve(null, { input });
  return result.user || result;
}

test('addUserToProject assigns user to project (happy path)', async () => {
  const admin = await createAdminUser();
  const user = await createRegularUser();
  const context = { user: admin };

  const project = await createProjectMutation.resolve(null, { input: { name: `project-${Date.now()}`, description: 'Test' } }, context);

  const result = await addUserToProjectMutation.resolve(null, { input: { projectID: project.projectID, userID: user.userID } }, context);

  expect(result).toBe(true);

  const userProject = await db.UserProject.findOne({
    where: { projectID: project.projectID, userID: user.userID }
  });
  expect(userProject).toBeDefined();
});

test('addUserToProject fails with duplicate assignment (sad path)', async () => {
  const admin = await createAdminUser();
  const user = await createRegularUser();
  const context = { user: admin };

  const project = await createProjectMutation.resolve(null, { input: { name: `project-${Date.now()}`, description: 'Test' } }, context);

  await addUserToProjectMutation.resolve(null, { input: { projectID: project.projectID, userID: user.userID } }, context);

  await expect(
    addUserToProjectMutation.resolve(null, { input: { projectID: project.projectID, userID: user.userID } }, context)
  ).rejects.toThrow('User is already assigned to this project');
});

test('removeUserFromProject unassigns user (happy path)', async () => {
  const admin = await createAdminUser();
  const user = await createRegularUser();
  const context = { user: admin };

  const project = await createProjectMutation.resolve(null, { input: { name: `project-${Date.now()}`, description: 'Test' } }, context);

  await addUserToProjectMutation.resolve(null, { input: { projectID: project.projectID, userID: user.userID } }, context);

  const result = await removeUserFromProjectMutation.resolve(null, { input: { projectID: project.projectID, userID: user.userID } }, context);

  expect(result).toBe(true);

  const userProject = await db.UserProject.findOne({
    where: { projectID: project.projectID, userID: user.userID }
  });
  expect(userProject).toBeNull();
});

test('removeUserFromProject fails when user not assigned (sad path)', async () => {
  const admin = await createAdminUser();
  const user = await createRegularUser();
  const context = { user: admin };

  const project = await createProjectMutation.resolve(null, { input: { name: `project-${Date.now()}`, description: 'Test' } }, context);

  await expect(
    removeUserFromProjectMutation.resolve(null, { input: { projectID: project.projectID, userID: user.userID } }, context)
  ).rejects.toThrow('User was not assigned to this project or project/user not found');
});

test('addUserToProject requires authentication (sad path)', async () => {
  await expect(
    addUserToProjectMutation.resolve(null, { input: { projectID: 1, userID: 1 } }, {})
  ).rejects.toThrow('Not authenticated');
});