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
    authorizeRoles(context, ['Admin']);

    const existing = await db.Team.findOne({ where: { name } });
    if (existing) throw new Error('Team already exists');

    return await db.Team.create({ name });
  },
};