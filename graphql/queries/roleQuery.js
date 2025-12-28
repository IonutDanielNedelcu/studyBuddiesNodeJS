const { GraphQLNonNull, GraphQLString } = require('graphql');
const RoleType = require('../types/roleType');
const db = require('../../models');

module.exports = {
  type: RoleType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_, { name }) => {
    return db.Role.findOne({ where: { name } });
  },
};
