'use strict';
const db = require('../models');
const taskQuery = require('../graphql/queries/taskQuery');
const tasksQuery = require('../graphql/queries/tasksQuery');
const tasksFromProjectQuery = require('../graphql/queries/tasksFromProjectQuery');

jest.setTimeout(15000);

const adminContext= { user: { userID: 0, roles: [{ name: 'Admin' }] } };

describe('Task queries - happy and sad paths', () => {
  let user;
  let task;
  let project;
  let sprint;

  beforeAll(async () => {
    const email = `test_task_user@example.com`;
    const username = `test_task`;
    user = await db.User.create({ email, password: 'testtask', username });
    // Create a test project and sprint 
    project = await db.Project.create({ name: 'Test Project - tasks', description: 'Auto-created by tests' });
    sprint = await db.Sprint.create({ projectID: project.projectID, number: 1, startDate: '2026-01-01', endDate: '2026-01-31', description: 'Test sprint' });
    task = await db.Task.create({
      name: `TestTask: query`,
      description: 'Task for query tests',
      projectID: project.projectID,
      sprintID: sprint.sprintID,
      reporterUserID: user.userID,
    });
  });

  afterAll(async () => {
    if (task && task.taskID) await db.Task.destroy({ where: { taskID: task.taskID } });
    if (user && user.userID) await db.User.destroy({ where: { userID: user.userID } });
    if (sprint && sprint.sprintID) await db.Sprint.destroy({ where: { sprintID: sprint.sprintID } });
    if (project && project.projectID) await db.Project.destroy({ where: { projectID: project.projectID } });
  });

  test('taskQuery - happy path', async () => {
    const result = await taskQuery.resolve(null, { taskID: task.taskID });
    expect(result).toBeDefined();
    expect(result.taskID).toBe(task.taskID);
  });

  test('taskQuery - sad path (task not found)', async () => {
    const notFound = await taskQuery.resolve(null, { taskID: 0 });
    expect(notFound).toBeNull();
  });

  test('tasksQuery - happy path (admin can list all)', async () => {
    const allTasks = await tasksQuery.resolve(null, null, adminContext);
    expect(Array.isArray(allTasks)).toBe(true);
    const found = allTasks.find(t => t.taskID === task.taskID);
    expect(found).toBeDefined();
  });

  test('tasksQuery - sad path (non-admin unauthorized)', async () => {
    const nonAdminContext = { user: { userID: user.userID, roles: [{ name: 'User' }] } };
    await expect(async () => tasksQuery.resolve(null, null, nonAdminContext)).rejects.toThrow(/Not authorized|Not authenticated/);
  });

  test('tasksFromProjectQuery - happy path', async () => {
    const items = await tasksFromProjectQuery.resolve(null, { projectName: project.name });
    expect(Array.isArray(items)).toBe(true);
  });

  test('tasksFromProjectQuery - sad path (project not found)', async () => {
    const empty = await tasksFromProjectQuery.resolve(null, { projectName: 'NonExistentProject' });
    expect(Array.isArray(empty)).toBe(true);
    expect(empty.length).toBe(0);
  });
});
