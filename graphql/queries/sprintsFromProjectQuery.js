const { GraphQLInt, GraphQLString } = require('graphql');
const SprintType = require('../types/sprintType');
const db = require('../../models');

module.exports = {
  type: SprintType,
  args: {
    projectName: { type: GraphQLString },
  },
  resolve: async (_source, { projectName }) => {
    return db.Sprint.findAll({ where: { projectName } });
  },
};