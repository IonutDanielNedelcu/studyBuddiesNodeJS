'use strict';

const db = require('../models');
const loginMutation = require('../graphql/mutations/loginMutation');
const sprintsFromProjectQuery = require('../graphql/queries/sprintsFromProjectQuery');
const tasksFromSprintQuery = require('../graphql/queries/tasksFromSprintQuery');
const projectsQuery = require('../graphql/queries/projectsQuery');
const taskQuery = require('../graphql/queries/taskQuery');
const updateTask = require('../graphql/mutations/updateTaskMutation');
const createComment = require('../graphql/mutations/createCommentMutation');
const { createEmployeeUser, createAdminUser } = require('./helpers');
const createRepositoryMutation = require('../graphql/mutations/createRepositoryMutation');
const createProjectMutation = require('../graphql/mutations/createProjectMutation');
const createSprint = require('../graphql/mutations/createSprintMutation');
const createTaskMutation = require('../graphql/mutations/createTaskMutation');
const deleteCommentMutation = require('../graphql/mutations/deleteCommentMutation');
const deleteTaskMutation = require('../graphql/mutations/deleteTaskMutation');
const deleteSprint = require('../graphql/mutations/deleteSprintMutation');
const deleteProjectMutation = require('../graphql/mutations/deleteProjectMutation');

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
  let adminContext;
  let admin;
  let employee;
  let context;
  let repo;
  let project;
  let sprint1;
  let sprint2;
  let sprint3;
  let task1;
  let task2;
  let task3;
  let comment;

  beforeAll(async () => {
    const adminUser = await createAdminUser();
    admin = adminUser;
    adminContext = { user: admin };

    // Create employee 
    employee = await createEmployeeUser();
    context = { user: { userID: employee.userID } };

    // Create repo
    repo = await createRepositoryMutation.resolve(null, { input: { name: 'Flow2 repo', url: 'http://example.com/flow2repo.git' } }, adminContext);

    // Create project 
    project = await createProjectMutation.resolve(null, { input: { name: `Flow2 Project`, description: 'Created by flow2 test', repositoryID: repo.repositoryID } }, adminContext);
    
    // Create sprints
    sprint1 = await createSprint.resolve(null, { input: { number: 1, startDate: '2026-01-01', endDate: '2026-01-31', description: 'Flow2 sprint 1', projectID: project.projectID }}, adminContext)
    sprint2 = await createSprint.resolve(null, { input: { number: 2, startDate: '2026-02-01', endDate: '2026-02-28', description: 'Flow2 sprint 2', projectID: project.projectID }}, adminContext)
    sprint3 = await createSprint.resolve(null, { input: { number: 3, startDate: '2026-03-01', endDate: '2026-03-31', description: 'Flow2 sprint 3', projectID: project.projectID }}, adminContext)
    
    // Create tasks for sprint 1
    task1 = await createTaskMutation.resolve(null, { input: { name: 'Flow2 Task 1', description: 'Task 1 desc', assigneeUsername: employee.username, projectName: project.name, sprintNumber: sprint1.number }}, adminContext)
    task2 = await createTaskMutation.resolve(null, { input: { name: 'Flow2 Task 2', description: 'Task 2 desc', assigneeUsername: employee.username, projectName: project.name, sprintNumber: sprint1.number }}, adminContext)
    task3 = await createTaskMutation.resolve(null, { input: { name: 'Flow2 Task 3', description: 'Task 3 desc', assigneeUsername: employee.username, projectName: project.name, sprintNumber: sprint1.number }}, adminContext)
  });

  afterAll(async () => {
    const db = require('../models');
    if (comment && comment.commentID) {
      try {
        await deleteCommentMutation.resolve(null, { commentID: comment.commentID }, adminContext);
      } catch (err) {
        if (!/Comment not found/.test(err.message)) throw err;
      }
    }
    if (task1 && task1.taskID) await deleteTaskMutation.resolve(null, { taskID: task1.taskID }, adminContext);
    if (task2 && task2.taskID) await deleteTaskMutation.resolve(null, { taskID: task2.taskID }, adminContext);
    if (task3 && task3.taskID) await deleteTaskMutation.resolve(null, { taskID: task3.taskID }, adminContext);
    if (sprint1 && sprint1.sprintID) await deleteSprint.resolve(null, { sprintID: sprint1.sprintID }, adminContext);
    if (sprint2 && sprint2.sprintID) await deleteSprint.resolve(null, { sprintID: sprint2.sprintID }, adminContext);
    if (sprint3 && sprint3.sprintID) await deleteSprint.resolve(null, { sprintID: sprint3.sprintID }, adminContext);
    if (project && project.projectID) await deleteProjectMutation.resolve(null, { projectID: project.projectID }, adminContext);
    if (repo && repo.repositoryID) await db.Repository.destroy({ where: { repositoryID: repo.repositoryID } });
    if (employee && employee.userID) await db.User.destroy({ where: { userID: employee.userID } });
  });

  test('Employee can login', async () => {
    const password = 'Test123!';
    const login = await loginMutation.resolve(null, { input: { email: employee.email, password } });
    expect(login).toBeDefined();
    expect(login.user.userID).toBe(employee.userID);
  });

  test('Employee can view project', async () => {
    const all = await projectsQuery.resolve(null, {}, context);
    const projectViewed = all.find(p => p.name === project.name);
    expect(projectViewed).toBeDefined();
    expect(projectViewed.name).toBe(project.name);
  });

  test('Employee can view sprints in project', async () => {
    const sprints = await sprintsFromProjectQuery.resolve(null, { projectName: project.name }, context);
    expect(Array.isArray(sprints)).toBe(true);
    expect(sprints.some(s => s.sprintID === sprint1.sprintID)).toBe(true);
  });

  test('Employee can view tasks in sprint', async () => {
    const tasksInSprint = await tasksFromSprintQuery.resolve(null, { projectName: project.name, sprintNumber: sprint1.number }, context);
    expect(Array.isArray(tasksInSprint)).toBe(true);
    expect(tasksInSprint.some(t => t.taskID === task1.taskID)).toBe(true);
  });

  test('Employee can view a task', async () => {
    const taskViewed = await taskQuery.resolve(null, { taskID: task1.taskID }, context);
    expect(taskViewed).toBeDefined();
    expect(taskViewed.taskID).toBe(task1.taskID);
  });

  test('Employee can update task', async () => {
    const updatedTask = await updateTask.resolve(null, { input: { taskID: task1.taskID, status: 'In Progress' } }, context);
    expect(updatedTask).toBeDefined();
    expect(updatedTask.status).toBe('In Progress');
  });

  test('Employee can add comment to task', async () => {
    const text = 'This is a comment from employee in flow2';
    comment = await createComment.resolve(null, { input: { text, taskID: task1.taskID } }, context);
    expect(comment).toBeDefined();
    expect(comment.text).toBe(text);
    expect(comment.user.userID).toBe(context.user.userID);
  });
});
