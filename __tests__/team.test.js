'use strict';
const createTeamMutation = require('../graphql/mutations/createTeamMutation');
const deleteTeamMutation = require('../graphql/mutations/deleteTeamMutation');
const changeUserTeamMutation = require('../graphql/mutations/changeUserTeamMutation');
const db = require('../models');

// short helper to create Admin context
const getAdminContext = async () => {
  const [role] = await db.Role.findOrCreate({ where: { name: 'Admin' } });
  const user = await db.User.create({
    email: `admin_${Date.now()}@test.com`,
    username: `admin_${Date.now()}`,
    password: 'pass', firstName: 'A', lastName: 'T'
  });
  await user.addRole(role);
  // reload user with roles for authorization to work
  const userWithRoles = await db.User.findByPk(user.userID, { include: [{ model: db.Role, as: 'roles' }] });
  return { user: userWithRoles };
};

describe('Team Tests', () => {
  test('Create and Delete Team', async () => {
    const context = await getAdminContext();
    
    // create team
    const team = await createTeamMutation.resolve(null, { name: `DevOps-${Date.now()}` }, context);
    expect(team.teamID).toBeDefined();

    // delete team
    const deleted = await deleteTeamMutation.resolve(null, { teamID: team.teamID }, context);
    expect(deleted).toBe(true);
  });

  test('Cannot delete team with members', async () => {
    const context = await getAdminContext();
    const team = await createTeamMutation.resolve(null, { name: `FullTeam-${Date.now()}` }, context);
    
    // add admin to the team
    await changeUserTeamMutation.resolve(null, { userID: context.user.userID, teamName: team.name }, context);

    await expect(deleteTeamMutation.resolve(null, { teamID: team.teamID }, context))
      .rejects.toThrow('Cannot delete team because it still has members assigned');
  });
});