'use strict';

// (admin) login - view user - remove from project - add to another project - change team - change position

const db = require('../models');
const registerMutation = require('../graphql/mutations/registerMutation');
const createProject = require('../graphql/mutations/createProjectMutation');
const addUserToProject = require('../graphql/mutations/addUserToProjectMutation');
const removeUserFromProject = require('../graphql/mutations/removeUserFromProjectMutation');
const createTeam = require('../graphql/mutations/createTeamMutation');
const changeUserTeam = require('../graphql/mutations/changeUserTeamMutation');
const createPosition = require('../graphql/mutations/createPositionMutation');
const addPositionToUser = require('../graphql/mutations/addPositionToUserMutation');
const { createAdminUser } = require('./helpers');

jest.setTimeout(30000);

describe('Full flow 2: admin manages user across projects, team and position', () => {
  let user;
  let projectA;
  let projectB;
  let team;
  let position;

  afterAll(async () => {
    // cleanup
    if (projectA && projectA.projectID) await db.Project.destroy({ where: { projectID: projectA.projectID } });
    if (projectB && projectB.projectID) await db.Project.destroy({ where: { projectID: projectB.projectID } });
    if (team && team.teamID) await db.Team.destroy({ where: { teamID: team.teamID } });
    if (position && position.positionID) await db.Position.destroy({ where: { positionID: position.positionID } });
    if (user && user.userID) await db.User.destroy({ where: { userID: user.userID } });

    // ensure no lingering user-project mappings
    if (projectA && user && user.userID) await db.UserProject.destroy({ where: { projectID: projectA.projectID, userID: user.userID } });
    if (projectB && user && user.userID) await db.UserProject.destroy({ where: { projectID: projectB.projectID, userID: user.userID } });
  });

  test('admin removes user from one project, reassigns to another, changes team and position', async () => {
    const admin = await createAdminUser();
    const adminContext = { user: admin };

    // 1) create a regular user
    const input = {
      email: `flow_user_${Date.now()}@example.com`,
      password: 'User123!',
      username: `flow_user_${Date.now()}`,
      firstName: 'Flow',
      lastName: 'User',
    };

    const res = await registerMutation.resolve(null, { input });
    user = res.user || res;
    expect(user).toBeDefined();

    // 2) create two projects
    projectA = await createProject.resolve(null, { input: { name: `flow_proj_A_${Date.now()}`, description: 'Project A' } }, adminContext);
    projectB = await createProject.resolve(null, { input: { name: `flow_proj_B_${Date.now()}`, description: 'Project B' } }, adminContext);
    expect(projectA).toBeDefined();
    expect(projectB).toBeDefined();

    // 3) add user to project A
    const added = await addUserToProject.resolve(null, { input: { projectID: projectA.projectID, userID: user.userID } }, adminContext);
    expect(added).toBe(true);

    const mapping = await db.UserProject.findOne({ where: { projectID: projectA.projectID, userID: user.userID } });
    expect(mapping).toBeDefined();

    // 4) remove user from project A
    const removed = await removeUserFromProject.resolve(null, { input: { projectID: projectA.projectID, userID: user.userID } }, adminContext);
    expect(removed).toBe(true);

    const mappingAfterRemove = await db.UserProject.findOne({ where: { projectID: projectA.projectID, userID: user.userID } });
    expect(mappingAfterRemove).toBeNull();

    // 5) add user to project B
    const addedB = await addUserToProject.resolve(null, { input: { projectID: projectB.projectID, userID: user.userID } }, adminContext);
    expect(addedB).toBe(true);

    const mappingB = await db.UserProject.findOne({ where: { projectID: projectB.projectID, userID: user.userID } });
    expect(mappingB).toBeDefined();

    // 6) create a team and change user's team
    const teamName = `flow_team_${Date.now()}`;
    team = await createTeam.resolve(null, { input: { name: teamName } }, adminContext);
    expect(team).toBeDefined();

    const changedTeamUser = await changeUserTeam.resolve(null, { userID: user.userID, teamName }, adminContext);
    expect(changedTeamUser).toBeDefined();
    expect(changedTeamUser.team).toBeDefined();
    expect(changedTeamUser.team.name).toBe(teamName);

    // 7) create a position and assign to user
    const posName = `flow_position_${Date.now()}`;
    position = await createPosition.resolve(null, { name: posName, seniority: 'Junior' }, adminContext);
    expect(position).toBeDefined();

    const updatedUser = await addPositionToUser.resolve(null, { username: user.username, positionID: position.positionID }, adminContext);
    expect(updatedUser).toBeDefined();
    expect(updatedUser.position).toBeDefined();
    expect(updatedUser.position.name).toBe(posName);
  });
});
