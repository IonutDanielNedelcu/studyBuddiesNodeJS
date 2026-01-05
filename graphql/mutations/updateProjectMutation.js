const { GraphQLNonNull, GraphQLInt, GraphQLString } = require('graphql');
const ProjectType = require('../types/projectType');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
  type: ProjectType,
  args: {
    projectID: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    repositoryID: { type: GraphQLInt },
  },
  resolve: async (_source, args, context) => {
    authorizeRoles(context, ['Admin', 'Manager']);

    const project = await db.Project.findByPk(args.projectID);
    if (!project) throw new Error('Project not found');

    if (args.repositoryID) {
        const repo = await db.Repository.findByPk(args.repositoryID);
        if (!repo) throw new Error('Repository ID not found');
    }

    await project.update(args);

    return db.Project.findByPk(project.projectID, {
        include: [{ model: db.Repository, as: 'repository' }]
    });
  },
};