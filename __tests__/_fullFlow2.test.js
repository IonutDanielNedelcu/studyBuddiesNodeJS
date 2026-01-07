'use strict';

const db = require('../models');
const loginMutation = require('../graphql/mutations/loginMutation');
const sprintsFromProjectQuery = require('../graphql/queries/sprintsFromProjectQuery');
const tasksFromSprintQuery = require('../graphql/queries/tasksFromSprintQuery');
const updateTask = require('../graphql/mutations/updateTaskMutation');
const createComment = require('../graphql/mutations/createCommentMutation');
const { createEmployeeUser, createAdminUser } = require('./helpers');
const createProjectMutation = require('../graphql/mutations/createProjectMutation');
const createTaskMutation = require('../graphql/mutations/createTaskMutation');
const deleteCommentMutation = require('../graphql/mutations/deleteCommentMutation');
const deleteTaskMutation = require('../graphql/mutations/deleteTaskMutation');

jest.setTimeout(30000);

// Flow: (employee) login - vad proiect - vad sprint - vad task - modific task - adaug comment
// Steps:
// 1) register/login as an Employee
// 2) see the Project 
// 3) list Sprints for the Project
// 4) list Tasks in the Sprint
// 5) see a Task
// 6) update the status of the Task 
// 7) add a Comment to the Task 

describe('Full flow - employee views and acts', () => {
  let comment;

  beforeAll(async () => {
    const adminContext= await createAdminUser();

    // Create employee 
    const employee = await createEmployeeUser();
    const context = { user: { userID: employee.userID } };

    // Create repo
    const repo = await createRepositoryMutation.resolve(null, { input: { name: 'Flow2 repo', url: 'http://example.com/flow2repo.git' } }, adminContext);

    // Create project 
    const project = await createProjectMutation.resolve(null, { input: { name: `Flow2 Project`, description: 'Created by flow2 test', repositoryID: repo.repositoryID } }, adminContext);
    
    // Create sprints
    const sprint1 = await createSprint.resolve(null, { input: { number: 1, startDate: '2026-01-01', endDate: '2026-01-31', description: 'Flow2 sprint 1', projectID: project.projectID }}, adminContext)
    const sprint2 = await createSprint.resolve(null, { input: { number: 2, startDate: '2026-02-01', endDate: '2026-02-28', description: 'Flow2 sprint 2', projectID: project.projectID }}, adminContext)
    const sprint3 = await createSprint.resolve(null, { input: { number: 3, startDate: '2026-03-01', endDate: '2026-03-31', description: 'Flow2 sprint 3', projectID: project.projectID }}, adminContext)
    
    // Create tasks for sprint 1
    const task1 = await createTaskMutation.resolve(null, { input: { name: 'Flow2 Task 1', description: 'Task 1 desc', assignee: employee.userID, projectID: project.projectID, sprintID: sprint1.sprintID }}, adminContext)
    const task2 = await createTaskMutation.resolve(null, { input: { name: 'Flow2 Task 2', description: 'Task 2 desc', assignee: employee.userID, projectID: project.projectID, sprintID: sprint1.sprintID }}, adminContext)
    const task3 = await createTaskMutation.resolve(null, { input: { name: 'Flow2 Task 3', description: 'Task 3 desc', assignee: employee.userID, projectID: project.projectID, sprintID: sprint1.sprintID }}, adminContext)
  });

  afterAll(async () => {
    if (comment && comment.commentID) await deleteCommentMutation.resolve(null, { input: { commentID: comment.commentID } });
    if (task1 && task1.taskID) await deleteTaskMutation.resolve(null, { input: { taskID: task1.taskID } });
    if (task2 && task2.taskID) await deleteTaskMutation.resolve(null, { input: { taskID: task2.taskID } });
    if (task3 && task3.taskID) await deleteTaskMutation.resolve(null, { input: { taskID: task3.taskID } });
    if (sprint1 && sprint1.sprintID) await deleteSprint.resolve(null, { input: { sprintID: sprint1.sprintID } }, adminContext);
    if (sprint2 && sprint2.sprintID) await deleteSprint.resolve(null, { input: { sprintID: sprint2.sprintID } }, adminContext);
    if (sprint3 && sprint3.sprintID) await deleteSprint.resolve(null, { input: { sprintID: sprint3.sprintID } }, adminContext);
    if (project && project.projectID) await deleteProjectMutation.resolve(null, { input: { projectID: project.projectID } }, adminContext);
    if (repo && repo.repositoryID) await deleteRepositoryMutation.resolve(null, { input: { repositoryID: repo.repositoryID } }, adminContext);
    if (employee && employee.userID) await deleteUserMutation.resolve(null, { input: { userID: employee.userID } }, adminContext);
  });

  test('Employee can login', async () => {
    const login = await loginMutation.resolve(null, { input: { email: employee.email, password: employee.password } });
    expect(login).toBeDefined();
    expect(login.user.userID).toBe(employee.userID);
  });

  test('Employee can view project', async () => {
    const projectViewed = await projectQuery.resolve(null, { name: 'Flow2 Project' }, context);
    expect(projectViewed).toBeDefined();
    expect(projectViewed.name).toBe('Flow2 Project');
  });

  test('Employee can view sprints in project', async () => {
    const sprints = await sprintsFromProjectQuery.resolve(null, { projectName: projectViewed.name }, context);
    expect(Array.isArray(sprints)).toBe(true);
    expect(sprints.some(s => s.sprintID === sprint.sprintID)).toBe(true);
  });

  test('Employee can view tasks in sprint', async () => {
    const tasksInSprint = await tasksFromSprintQuery.resolve(null, { projectName: project.name, sprintNumber: sprint1.number }, context);
    expect(Array.isArray(tasksInSprint)).toBe(true);
    expect(tasksInSprint.some(t => t.taskID === task.taskID)).toBe(true);
  });

  test('Employee can view a task', async () => {
    const taskViewed = await taskQuery.resolve(null, { taskID: task1.taskID }, context);
    expect(taskViewed).toBeDefined();
    expect(taskViewed.taskID).toBe(task1.taskID);
  });

  test('Employee can update task', async () => {
    const updatedTask = await updateTask.resolve(null, { input: { taskID: task.taskID, status: 'In Progress' } }, context);
    expect(updatedTask).toBeDefined();
    expect(updatedTask.status).toBe('In Progress');
  });

  test('Employee can add comment to task', async () => {
    const text = 'This is a comment from employee in flow2';
    const comment = await createComment.resolve(null, { input: { text, taskID: task.taskID } }, context);
    expect(comment).toBeDefined();
    expect(comment.text).toBe(text);
    expect(comment.user.userID).toBe(context.user.userID);
  });
});
