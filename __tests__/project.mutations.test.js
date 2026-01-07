'use strict';

const createProjectMutation = require('../graphql/mutations/createProjectMutation');
const updateProjectMutation = require('../graphql/mutations/updateProjectMutation');
const deleteProjectMutation = require('../graphql/mutations/deleteProjectMutation');
const createRepositoryMutation = require('../graphql/mutations/createRepositoryMutation');
const { createAdminUser } = require('./helpers');
const db = require('../models');

jest.setTimeout(15000);

test('createProject with valid data (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const name = `test-project-${Date.now()}`;
  const description = 'Test project description';

  const result = await createProjectMutation.resolve(null, { input: { name, description } }, context);

  expect(result).toBeDefined();
  expect(result.projectID).toBeDefined();
  expect(result.name).toBe(name);
  expect(result.description).toBe(description);
});

test('createProject with repository link (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const repoName = `test-repo-${Date.now()}`;
  const repo = await createRepositoryMutation.resolve(null, { input: { name: repoName, url: 'https://github.com/test/repo' } }, context);

  const projectName = `test-project-${Date.now()}`;
  const result = await createProjectMutation.resolve(null, { input: { name: projectName, description: 'Test', repositoryID: repo.repositoryID } }, context);

  expect(result).toBeDefined();
  expect(result.repository).toBeDefined();
  expect(result.repository.repositoryID).toBe(repo.repositoryID);
  expect(result.repository).toBeDefined();
  expect(result.repository.name).toBe(repoName);
});

test('createProject fails when repository is already linked (sad path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const repo = await createRepositoryMutation.resolve(null, { input: { name: `unique-repo-${Date.now()}`, url: 'https://github.com/test/unique' } }, context);

  await createProjectMutation.resolve(null, { input: { name: `project1-${Date.now()}`, description: 'First', repositoryID: repo.repositoryID } }, context);

  await expect(
    createProjectMutation.resolve(null, { input: { name: `project2-${Date.now()}`, description: 'Second', repositoryID: repo.repositoryID } }, context)
  ).rejects.toThrow('This repository is already assigned to another project');
});

test('createProject fails with invalid repository ID (sad path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  await expect(
    createProjectMutation.resolve(null, { input: { name: `project-${Date.now()}`, description: 'Test', repositoryID: 9999 } }, context)
  ).rejects.toThrow('Repository ID not found');
});

test('updateProject changes name and description (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const project = await createProjectMutation.resolve(null, { input: { name: `original-${Date.now()}`, description: 'Original' } }, context);

  const updatedName = `updated-${Date.now()}`;
  const updatedDescription = 'Updated description';

  const result = await updateProjectMutation.resolve(null, { input: { projectID: project.projectID, name: updatedName, description: updatedDescription } }, context);

  expect(result.name).toBe(updatedName);
  expect(result.description).toBe(updatedDescription);
});

test('updateProject fails with non-existent project (sad path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  await expect(
    updateProjectMutation.resolve(null, { input: { projectID: 9999, name: 'Updated' } }, context)
  ).rejects.toThrow('Project not found');
});

test('deleteProject removes project (happy path)', async () => {
  const user = await createAdminUser();
  const context = { user };

  const project = await createProjectMutation.resolve(null, { input: { name: `to-delete-${Date.now()}`, description: 'Delete me' } }, context);

  const result = await deleteProjectMutation.resolve(null, { projectID: project.projectID }, context);

  expect(result).toBe(true);

  const deleted = await db.Project.findByPk(project.projectID);
  expect(deleted).toBeNull();
});

test('deleteProject requires authentication (sad path)', async () => {
  await expect(
    deleteProjectMutation.resolve(null, { projectID: 1 }, {})
  ).rejects.toThrow('Not authenticated');
});