'use strict';
const db = require('../models');
const createSprint = require('../graphql/mutations/createSprintMutation');
const updateSprint = require('../graphql/mutations/updateSprintMutation');
const deleteSprint = require('../graphql/mutations/deleteSprintMutation');

jest.setTimeout(15000);

const adminContext= { user: { userID: 0, roles: [{ name: 'Admin' }] } };

describe('Sprint mutations - happy and sad paths', () => {
  let sprint;
  let project;

  beforeAll(async () => {
    // Create a test project 
    project = await db.Project.create({ name: 'Test Project - sprints', description: 'Auto-created by tests' });
  });
  
  afterAll(async () => {
    if (project && project.projectID) await db.Project.destroy({ where: { projectID: project.projectID } });
    if (sprint && sprint.sprintID) await db.Sprint.destroy({ where: { sprintID: sprint.sprintID } });
  });

  test('createSprint - happy path', async () => {
    const input = {
      number: 999,
      description: `TestSprint: happy`,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      projectID: project.projectID,
    };
    const res = await createSprint.resolve(null, { input }, adminContext);
    expect(res).toBeDefined();
    expect(res.number).toBe(input.number);
    sprint = res;
  });

  test('createSprint - sad path (missing required field)', async () => {
    const badInput = { description: 'TestSprint: sad', startDate: '2026-01-01', endDate: '2026-01-31', projectID: 1 };
    await expect(createSprint.resolve(null, { input: badInput }, adminContext)).rejects.toThrow();
  });

  test('updateSprint - happy path', async () => {
    const input = { sprintID: sprint.sprintID, description: `TestSprint: updated` };
    const updated = await updateSprint.resolve(null, { input }, adminContext);
    expect(updated).toBeDefined();
    expect(updated.description).toBe(input.description);
  });

  test('updateSprint - sad path (sprint not found)', async () => {
    await expect(updateSprint.resolve(null, { input: { sprintID: 9999, description: 'x' } }, adminContext)).rejects.toThrow('Sprint not found');
  });

  test('deleteSprint - happy path', async () => {
    const temp = await db.Sprint.create({
      number: 1000,
      description: `TestSprint: temp`,
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      projectID: 1,
    });

    const res = await deleteSprint.resolve(null, { sprintID: temp.sprintID }, adminContext);
    expect(res).toBe(`Sprint ${temp.sprintID} deleted`);
  });

  test('deleteSprint - sad path (sprint not found)', async () => {
    await expect(deleteSprint.resolve(null, { sprintID: 1001 }, adminContext)).rejects.toThrow('Sprint not found');
  });
});
