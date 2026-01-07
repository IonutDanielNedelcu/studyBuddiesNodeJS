'use strict';

const db = require('../models');
const commentsQuery = require('../graphql/queries/commentsQuery');
const commentsByTaskQuery = require('../graphql/queries/commentsByTaskQuery');
const commentsByTaskPageQuery = require('../graphql/queries/commentsByTaskPageQuery');
const commentsPageQuery = require('../graphql/queries/commentsPageQuery');
const commentsOfEmployeeQuery = require('../graphql/queries/commentsOfEmployeeQuery');

jest.setTimeout(15000);

const adminContext= { user: { userID: 0, roles: [{ name: 'Admin' }] } };

describe('Comment queries - happy and sad paths', () => {
  let user;
  let task;
  let comment;
  let project;

  beforeAll(async () => {
    // Create a user that will be the creator 
    const email = "test_comment_user@example.com";
    const username = "test_user";
    user = await db.User.create({ email, password: 'x', username });

    // Create a test project and sprint 
    project = await db.Project.create({ name: 'Test Project - comments', description: 'Auto-created by tests' });
    sprint = await db.Sprint.create({ projectID: project.projectID, number: 1, startDate: '2026-01-01', endDate: '2026-01-31', description: 'Test sprint' });
        
    task = await db.Task.create({
      name: 'Test Task',
      description: 'Task for comment query tests',
      projectID: project.projectID,
      reporterUserID: user.userID,
    });

    comment = await db.Comment.create({ text: `TestComment: happy`, userID: user.userID, taskID: task.taskID });
  });

  afterAll(async () => {
    if (comment && comment.commentID) await db.Comment.destroy({ where: { commentID: comment.commentID } });
    if (task && task.taskID) await db.Task.destroy({ where: { taskID: task.taskID } });
    if (user && user.userID) await db.User.destroy({ where: { userID: user.userID } });
    if (sprint && sprint.sprintID) await db.Sprint.destroy({ where: { sprintID: sprint.sprintID } });
    if (project && project.projectID) await db.Project.destroy({ where: { projectID: project.projectID } });
  });

  test('commentsQuery - happy path (admin can list all)', async () => {
    const allComments = await commentsQuery.resolve(null, null, adminContext);
    expect(Array.isArray(allComments)).toBe(true);
    const found = allComments.find(c => c.commentID === comment.commentID);
    expect(found).toBeDefined();
  });

  test('commentsQuery - sad path (non-admin unauthorized)', async () => {
    const nonAdminContext = { user: { userID: user.userID, roles: [{ name: 'User' }] } };
    await expect(async () => commentsQuery.resolve(null, null, nonAdminContext)).rejects.toThrow(/Not authorized|Not authenticated/);
  });

  test('commentsByTaskQuery - happy path', async () => {
    const items = await commentsByTaskQuery.resolve(null, { taskID: task.taskID });
    expect(Array.isArray(items)).toBe(true);
    expect(items.some(c => c.commentID === comment.commentID)).toBe(true);
  });

  test('commentsByTaskQuery - sad path (null taskID)', async () => {
    const empty = await commentsByTaskQuery.resolve(null, { taskID: null });
    expect(Array.isArray(empty)).toBe(true);
    expect(empty.length).toBe(0);
  });

  test('commentsByTaskPageQuery - happy path', async () => {
    const page = await commentsByTaskPageQuery.resolve(null, { taskID: task.taskID, offset: 0, limit: 10 });
    expect(page).toBeDefined();
    expect(Array.isArray(page.items)).toBe(true);
    expect(page.totalCount).toBeGreaterThanOrEqual(1);
  });

  test('commentsByTaskPageQuery - sad path (null taskID)', async () => {
    const emptyPage = await commentsByTaskPageQuery.resolve(null, { taskID: null });
    expect(emptyPage.items.length).toBe(0);
    expect(emptyPage.totalCount).toBe(0);
  });

  test('commentsPageQuery - happy path (admin can list page)', async () => {
    const page = await commentsPageQuery.resolve(null, { offset: 0, limit: 10 }, adminContext);
    expect(page).toBeDefined();
    expect(Array.isArray(page.items)).toBe(true);
  });

  test('commentsPageQuery - sad path (non-admin unauthorized)', async () => {
    const nonAdminContext = { user: { userID: user.userID, roles: [{ name: 'User' }] } };
    await expect(async () => commentsPageQuery.resolve(null, { offset: 0, limit: 10 }, nonAdminContext)).rejects.toThrow(/Not authorized|Not authenticated/);
  });

  test('commentsOfEmployeeQuery - happy path', async () => {
    const list = await commentsOfEmployeeQuery.resolve(null, { employeeUsername: user.username });
    expect(Array.isArray(list)).toBe(true);
    expect(list.some(c => c.commentID === comment.commentID)).toBe(true);
  });

  test('commentsOfEmployeeQuery - sad path (user not found)', async () => {
    const none = await commentsOfEmployeeQuery.resolve(null, { employeeUsername: 'no_such_user' });
    expect(Array.isArray(none)).toBe(true);
    expect(none.length).toBe(0);
  });
});
