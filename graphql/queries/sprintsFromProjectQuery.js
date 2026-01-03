const { GraphQLInt, GraphQLString } = require('graphql');
const SprintType = require('../types/sprintType');
const db = require('../../models');

module.exports = {
  type: SprintType,
  args: {
    projectName: { type: GraphQLString },
  },
  resolve: async (_source, { projectName }) => {
    if (projectName == null) return [];
    const project = await db.Project.findOne({ where: { name: projectName } });
    if (!project) return [];
    return db.Sprint.findAll({ where: { projectID: project.projectID } });
  },
};