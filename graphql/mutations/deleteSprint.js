const { GraphQLNonNull, GraphQLInt } = require('graphql');
const SprintType = require('../types/sprintType');
const { authorizeRoles } = require('../../utils/authorize');
const db = require('../../models');

module.exports = {
  type: SprintType,
  args: {
    sprintID: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: async (_source, { sprintID }, context) => {
    // only Admins and Managers can perform this action
    authorizeRoles(context, ['Admin', 'Manager']);

    const sprint = await db.Sprint.findByPk(sprintID);
    if (!sprint) throw new Error('Sprint not found');

    await sprint.destroy();
    
    return sprint;
  },
};