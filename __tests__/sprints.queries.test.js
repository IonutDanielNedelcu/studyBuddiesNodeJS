'use strict';
const db = require('../models');
const sprintQuery = require('../graphql/queries/sprintQuery');
const sprintsQuery = require('../graphql/queries/sprintsQuery');
const sprintsFromProjectQuery = require('../graphql/queries/sprintsFromProjectQuery');

jest.setTimeout(15000);

const adminContext= { user: { userID: 0, roles: [{ name: 'Admin' }] } };

describe('Sprint queries - happy and sad paths', () => {
  let sprint;
  let project;

  beforeAll(async () => {
    // Create a test project 
    project = await db.Project.create({ name: 'Test Project - sprints', description: 'Auto-created by tests' });
    
    sprint = await db.Sprint.create({
      number: 1000,
      description: `TestSprint: query`,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      projectID: project.projectID,
    });
  });

  afterAll(async () => {
    if (project && project.projectID) await db.Project.destroy({ where: { projectID: project.projectID } });
    if (sprint && sprint.sprintID) await db.Sprint.destroy({ where: { sprintID: sprint.sprintID } });
  });

  test('sprintQuery - happy path', async () => {
    const result = await sprintQuery.resolve(null, { projectName: project.name, sprintNumber: sprint.number });
    expect(result).toBeDefined();
    expect(result.sprintID).toBe(sprint.sprintID);
  });

  test('sprintQuery - sad path (sprint not found)', async () => {
    const notFound = await sprintQuery.resolve(null, { projectName: project.name, sprintNumber: 1001 });
    expect(notFound).toBeNull();
  });

  test('sprintsQuery - happy path (admin can list all)', async () => {
    const all = await sprintsQuery.resolve(null, null, adminContext);
    expect(Array.isArray(all)).toBe(true);
    const found = all.find(s => s.sprintID === sprint.sprintID);
    expect(found).toBeDefined();
  });

  test('sprintsQuery - sad path (non-admin unauthorized)', async () => {
    const nonAdminContext = { user: { userID: 1000, roles: [{ name: 'User' }] } };
    await expect(async () => sprintsQuery.resolve(null, null, nonAdminContext)).rejects.toThrow(/Not authorized|Not authenticated/);
  });

  test('sprintsFromProjectQuery - happy path', async () => {
    const items = await sprintsFromProjectQuery.resolve(null, { projectName: project.name });
    expect(Array.isArray(items)).toBe(true);
    const found = items.find(s => s.sprintID === sprint.sprintID);
    expect(found).toBeDefined();
  });

  test('sprintsFromProjectQuery - sad path (project not found)', async () => {
    const empty = await sprintsFromProjectQuery.resolve(null, { projectName: 'NonExistentProject' });
    expect(Array.isArray(empty)).toBe(true);
    expect(empty.length).toBe(0);
  });
});
