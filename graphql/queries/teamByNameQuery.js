const { GraphQLNonNull, GraphQLString } = require('graphql');
const TeamType = require('../types/teamType');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
  type: TeamType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_source, { name }, context) => {
    authorizeRoles(context, ['Admin', 'Manager']);
    return db.Team.findOne({ where: { name } });
  },
};
