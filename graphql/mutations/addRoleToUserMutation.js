const { GraphQLNonNull, GraphQLString } = require('graphql');
const UserType = require('../types/userType');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
  type: UserType,
  args: {
    username: { type: new GraphQLNonNull(GraphQLString) },
    roleName: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_source, { username, roleName }, context) => {
    // only Admins can perform this action
    authorizeRoles(context, ['Admin']);

    const user = await db.User.findOne({ where: { username } });
    if (!user) throw new Error('User not found');

    const role = await db.Role.findOne({ where: { name: roleName } });
    if (!role) throw new Error('Role not found');

    // associate role with user if not already
    await db.UserRole.findOrCreate({ where: { userID: user.userID, roleID: role.roleID }, defaults: { userID: user.userID, roleID: role.roleID } });

    const userWithRoles = await db.User.findByPk(user.userID, { include: [{ model: db.Role, as: 'roles' }] });
    return userWithRoles;
  },
};
