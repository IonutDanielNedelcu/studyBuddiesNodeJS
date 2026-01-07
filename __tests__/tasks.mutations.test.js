'use strict';
const db = require('../models');
const createTask = require('../graphql/mutations/createTaskMutation');
const updateTask = require('../graphql/mutations/updateTaskMutation');
const deleteTask = require('../graphql/mutations/deleteTaskMutation');

jest.setTimeout(15000);

const adminContext= { user: { userID: 0, roles: [{ name: 'Admin' }] } };

describe('Task mutations - happy and sad paths', () => {
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
  });

  afterAll(async () => {
    try { if (task && task.taskID) await db.Task.destroy({ where: { taskID: task.taskID } }); } catch (e) { /* ignore */ }
    try { if (sprint && sprint.sprintID) await db.Sprint.destroy({ where: { sprintID: sprint.sprintID } }); } catch (e) { /* ignore */ }
    try { if (project && project.projectID) await db.Project.destroy({ where: { projectID: project.projectID } }); } catch (e) { /* ignore */ }
    try { if (user && user.userID) await db.User.destroy({ where: { userID: user.userID } }); } catch (e) { /* ignore */ }
  });

  test('createTask - happy path', async () => {
    const userContext = { user: { userID: user.userID } };

    const input = {
      name: `TestTask: happy`,
      description: 'Task description',
      projectName: project.name,
      sprintNumber: 1,
    };
    const res = await createTask.resolve(null, { input }, userContext);
    expect(res).toBeDefined();
    expect(res.name).toBe(input.name);
    expect(res.reporterUserID).toBe(user.userID);
    task = res;
  });

  test('createTask - sad path (sprint not found)', async () => {
    const userContext = { user: { userID: user.userID } };

    const badInput = { name: 'x', description: 'y', projectName: project.name, sprintNumber: 9999 };
    await expect(createTask.resolve(null, { input: badInput }, userContext)).rejects.toThrow('Sprint not found');
  });

  test('updateTask - happy path', async () => {
    const userContext = { user: { userID: user.userID } };
    const input = { taskID: task.taskID, status: 'In Progress' };
    const updated = await updateTask.resolve(null, { input }, userContext);
    expect(updated).toBeDefined();
    expect(updated.status).toBe('In Progress');
  });

  test('updateTask - sad path (task not found)', async () => {
    const userContext = { user: { userID: user.userID } };

    await expect(updateTask.resolve(null, { input: { taskID: 0, status: 'Done' } }, userContext)).rejects.toThrow('Task not found');
  });

  test('deleteTask - happy path', async () => {
    const temp = await db.Task.create({
      name: `TestTask: temp`,
      description: 'Temp task for delete test',
      projectID: project.projectID,
      reporterUserID: user.userID,
    });

    const res = await deleteTask.resolve(null, { taskID: temp.taskID }, adminContext);
    expect(res).toBe(`Task ${temp.taskID} deleted`);
  });

  test('deleteTask - sad path (task not found)', async () => {
    await expect(deleteTask.resolve(null, { taskID: 0 }, adminContext)).rejects.toThrow('Task not found');
  });
});
