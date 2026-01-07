'use strict';

const db = require('../models');
const createComment = require('../graphql/mutations/createCommentMutation');
const updateComment = require('../graphql/mutations/updateCommentMutation');
const deleteComment = require('../graphql/mutations/deleteCommentMutation');

jest.setTimeout(15000);

describe('Comment mutations', () => {
  let user;
  let task;
  let comment;
  let project;
  let sprint;

  beforeAll(async () => {
    // Create a user that will be the creator
    const email = "test_comment_user@example.com";
    const username = "test_user";
    user = await db.User.create({ email, password: 'x', username });

    // Create a test project and sprint 
    project = await db.Project.create({ name: 'Test Project - comments', description: 'Auto-created by tests' });
    sprint = await db.Sprint.create({ projectID: project.projectID, number: 1, startDate: '2026-01-01', endDate: '2026-01-31', description: 'Test sprint' });
    
    // Create a task to comment on using the ensured project
    task = await db.Task.create({
      name: 'Test Task',
      description: 'Task for comment tests',
      projectID: project.projectID,
      reporterUserID: user.userID,
    });
  });
  afterAll(async () => {
    // Clean up the items we created
    if (comment && comment.commentID) await db.Comment.destroy({ where: { commentID: comment.commentID } });
    if (task && task.taskID) await db.Task.destroy({ where: { taskID: task.taskID } });
    if (user && user.userID) await db.User.destroy({ where: { userID: user.userID } });
    if (sprint && sprint.sprintID) await db.Sprint.destroy({ where: { sprintID: sprint.sprintID } });
    if (project && project.projectID) await db.Project.destroy({ where: { projectID: project.projectID } });
  });

  test('createComment - happy path', async () => {
    const userContext = { user: { userID: user.userID } };

    const text = `TestComment: happy`;
    const res = await createComment.resolve(null, { input: { text, taskID: task.taskID } }, userContext);
    expect(res).toBeDefined();
    expect(res.text).toBe(text);
    comment = res;
  });

  test('updateComment - happy path', async () => {
    const userContext = { user: { userID: user.userID } };

    const newText = `TestComment: updated`;
    const updated = await updateComment.resolve(null, { input: { commentID: comment.commentID, text: newText } }, userContext);
    expect(updated).toBeDefined();
    expect(updated.text).toBe(newText);
  });

  test('updateComment - sad path (comment not found)', async () => {
    const userContext = { user: { userID: user.userID } };

    await expect(updateComment.resolve(null, { input: { commentID: -1, text: 'x' } }, userContext)).rejects.toThrow('Comment not found');
  });

  test('deleteComment - happy path', async () => {
    const temp = await db.Comment.create({ text: `TestComment: for delete`, userID: user.userID, taskID: task.taskID });

    const res = await deleteComment.resolve(null, { commentID: temp.commentID });
    expect(res).toBe(`Comment ${temp.commentID} deleted`);
  });

  test('deleteComment - sad path (comment not found)', async () => {
    await expect(deleteComment.resolve(null, { commentID: -1 })).rejects.toThrow('Comment not found');
  });
});
