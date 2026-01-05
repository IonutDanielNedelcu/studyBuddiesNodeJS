const { GraphQLNonNull, GraphQLInt, GraphQLBoolean } = require('graphql');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
  type: GraphQLBoolean,
  args: {
    projectID: { type: new GraphQLNonNull(GraphQLInt) },
    userID: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: async (_source, { projectID, userID }, context) => {
    authorizeRoles(context, ['Admin', 'Manager']);

    const deletedCount = await db.UserProject.destroy({
      where: { projectID, userID }
    });

    if (deletedCount === 0) {
      throw new Error('User was not assigned to this project or project/user not found');
    }

    return true;
  },
};