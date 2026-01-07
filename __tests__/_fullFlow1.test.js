'use strict';

// (admin/manager) login - create repository - create proiect - add users - add sprint - add tasks

const db = require('../models');
const registerMutation = require('../graphql/mutations/registerMutation');
const createRepository = require('../graphql/mutations/createRepositoryMutation');
const createProject = require('../graphql/mutations/createProjectMutation');
const addUserToProject = require('../graphql/mutations/addUserToProjectMutation');
const createSprint = require('../graphql/mutations/createSprintMutation');
const createTask = require('../graphql/mutations/createTaskMutation');

jest.setTimeout(30000);

const adminContext = { user: { userID: 0, roles: [{ name: 'Admin' }] } };

describe('Full flow: admin -> repo -> project -> add users -> sprint -> tasks', () => {
  let repo;
  let project;
  let users = [];
  let sprint;
  let task;

  afterAll(async () => {
    // cleanup created records if they exist
    if (task && task.taskID) await db.Task.destroy({ where: { taskID: task.taskID } });
    if (sprint && sprint.sprintID) await db.Sprint.destroy({ where: { sprintID: sprint.sprintID } });
    if (project && project.projectID) await db.Project.destroy({ where: { projectID: project.projectID } });
    if (repo && repo.repositoryID) await db.Repository.destroy({ where: { repositoryID: repo.repositoryID } });
    for (const u of users) {
      if (u && u.userID) await db.User.destroy({ where: { userID: u.userID } });
    }
  });

  test('complete happy path', async () => {
    // 1) create repository as admin
    const repoName = `jest_repo_${Date.now()}`;
    repo = await createRepository.resolve(null, { name: repoName, url: 'https://example.com' }, adminContext);
    expect(repo).toBeDefined();
    expect(repo.name).toBe(repoName);

    // 2) create project linked to repository
    const projectName = `jest_project_${Date.now()}`;
    project = await createProject.resolve(null, { name: projectName, description: 'Created by jest', repositoryID: repo.repositoryID }, adminContext);
    expect(project).toBeDefined();
    expect(project.name).toBe(projectName);

    // 3) create two users via register mutation
    const password = 'P@ssw0rd!';
    const u1Input = { email: `u1_${Date.now()}@example.com`, password, username: `u1_${Date.now()}`, firstName: 'User', lastName: 'One' };
    const u2Input = { email: `u2_${Date.now()}@example.com`, password, username: `u2_${Date.now()}`, firstName: 'User', lastName: 'Two' };

    const created1 = await registerMutation.resolve(null, { input: u1Input });
    const created2 = await registerMutation.resolve(null, { input: u2Input });
    expect(created1).toBeDefined();
    expect(created2).toBeDefined();
    users.push(created1.user, created2.user);

    // 4) add users to project as admin
    const added1 = await addUserToProject.resolve(null, { projectID: project.projectID, userID: created1.user.userID }, adminContext);
    const added2 = await addUserToProject.resolve(null, { projectID: project.projectID, userID: created2.user.userID }, adminContext);
    expect(added1).toBe(true);
    expect(added2).toBe(true);

    // 5) create a sprint for the project
    const sprintInput = {
      number: Math.floor(Math.random() * 10000),
      description: 'Jest sprint',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      projectID: project.projectID,
    };
    sprint = await createSprint.resolve(null, { input: sprintInput }, adminContext);
    expect(sprint).toBeDefined();
    expect(sprint.number).toBe(sprintInput.number);

    // 6) create a task: reporter will be user1 (use reporter context)
    const reporterContext = { user: { userID: created1.user.userID } };
    const taskInput = {
      name: `Jest Task ${Date.now()}`,
      description: 'Task created as part of full flow test',
      projectName: project.name,
      sprintNumber: sprint.number,
      assigneeUsername: created2.user.username,
    };

    task = await createTask.resolve(null, { input: taskInput }, reporterContext);
    expect(task).toBeDefined();
    expect(task.name).toBe(taskInput.name);
    expect(task.project).toBeDefined();
    expect(task.project.name).toBe(project.name);
    expect(task.sprint).toBeDefined();
    expect(task.sprint.number).toBe(sprint.number);
    expect(task.assignee).toBeDefined();
    expect(task.assignee.username).toBe(created2.user.username);
  });
});
