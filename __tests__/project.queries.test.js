'use strict';

const projectsQuery = require('../graphql/queries/projectsQuery');
const projectsByUserQuery = require('../graphql/queries/projectsByUserQuery');
const createProjectMutation = require('../graphql/mutations/createProjectMutation');
const addUserToProjectMutation = require('../graphql/mutations/addUserToProjectMutation');
const { createAdminUser, createEmployeeUser } = require('./helpers');
const db = require('../models');

jest.setTimeout(15000);

test('projects query returns all projects (happy path)', async () => {
  const user = await createEmployeeUser();
  const context = { user };

  const admin = await createAdminUser();
  const adminContext = { user: admin };

  await createProjectMutation.resolve(null, { name: `project1-${Date.now()}`, description: 'Test 1' }, adminContext);
  await createProjectMutation.resolve(null, { name: `project2-${Date.now()}`, description: 'Test 2' }, adminContext);

  const result = await projectsQuery.resolve(null, {}, context);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThanOrEqual(2);
});

test('projects query requires authentication (sad path)', async () => {
  await expect(
    projectsQuery.resolve(null, {}, {})
  ).rejects.toThrow('Not authenticated');
});

test('projectsByUser query returns user projects (happy path)', async () => {
  const admin = await createAdminUser();
  const adminContext = { user: admin };

  const user = await createEmployeeUser();
  const userContext = { user };

  const project = await createProjectMutation.resolve(null, { name: `user-project-${Date.now()}`, description: 'Test' }, adminContext);
  await addUserToProjectMutation.resolve(null, { projectID: project.projectID, userID: user.userID }, adminContext);

  const result = await projectsByUserQuery.resolve(null, { username: user.username }, userContext);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThanOrEqual(1);
  expect(result[0].projectID).toBe(project.projectID);
});

test('projectsByUser query returns empty for user with no projects (sad path)', async () => {
  const user = await createEmployeeUser();
  const context = { user };

  const result = await projectsByUserQuery.resolve(null, { username: user.username }, context);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBe(0);
});
