const { GraphQLList } = require('graphql');
const UserType = require('../types/userType');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
  type: new GraphQLList(UserType),
  resolve: async (_source, _args, context) => {
    authorizeRoles(context, ['Admin', 'Manager']);
    const users = await db.User.findAll({ include: [{ model: db.Role, as: 'roles' }] });
    return users;
  },
};
