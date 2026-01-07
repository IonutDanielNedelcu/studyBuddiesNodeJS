'use strict';

const projectsByUserQuery = require('../graphql/queries/projectsByUserQuery');
const createProjectMutation = require('../graphql/mutations/createProjectMutation');
const addUserToProjectMutation = require('../graphql/mutations/addUserToProjectMutation');
const registerMutation = require('../graphql/mutations/registerMutation');
const { createAdminUser, createEmployeeUser } = require('./helpers');
const db = require('../models');

jest.setTimeout(15000);

test('projectsByUser returns projects assigned to user (happy path)', async () => {
  const admin = await createAdminUser();
  const adminContext = { user: admin };

  const employee = await createEmployeeUser();
  const employeeContext = { user: employee };

  const project1 = await createProjectMutation.resolve(null, { input: { name: `project1-${Date.now()}`, description: 'Test 1' } }, adminContext);
  const project2 = await createProjectMutation.resolve(null, { input: { name: `project2-${Date.now()}`, description: 'Test 2' } }, adminContext);

  await addUserToProjectMutation.resolve(null, { input: { projectID: project1.projectID, userID: employee.userID } }, adminContext);
  await addUserToProjectMutation.resolve(null, { input: { projectID: project2.projectID, userID: employee.userID } }, adminContext);

  const result = await projectsByUserQuery.resolve(null, { username: employee.username }, employeeContext);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBe(2);
});

test('projectsByUser returns empty array when user has no projects (sad path)', async () => {
  const employee = await createEmployeeUser();
  const employeeContext = { user: employee };

  const result = await projectsByUserQuery.resolve(null, { username: employee.username }, employeeContext);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBe(0);
});

test('projectsByUser requires authentication (sad path)', async () => {
  await expect(
    projectsByUserQuery.resolve(null, { username: 'someuser' }, {})
  ).rejects.toThrow('Not authenticated');
});

test('projectsByUser returns empty for non-existent user (sad path)', async () => {
  const admin = await createAdminUser();
  const context = { user: admin };

  const result = await projectsByUserQuery.resolve(null, { username: 'nonexistentuser' }, context);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBe(0);
});
