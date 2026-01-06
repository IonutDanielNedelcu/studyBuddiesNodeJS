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

    const project = await db.Project.findByPk(projectID);
    if (!project) throw new Error('Project not found');

    const user = await db.User.findByPk(userID);
    if (!user) throw new Error('User not found');

    const existingEntry = await db.UserProject.findOne({
      where: { projectID, userID }
    });

    if (existingEntry) {
      throw new Error('User is already assigned to this project');
    }

    await db.UserProject.create({ projectID, userID });

    return true;
  },
};