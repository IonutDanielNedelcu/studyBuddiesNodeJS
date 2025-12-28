const { GraphQLInt, GraphQLString } = require('graphql');
const SprintType = require('../types/sprintType');
const db = require('../../models');

module.exports = {
  type: SprintType,
  args: {
    projectName: { type: GraphQLString },
    sprintNumber: { type: GraphQLInt },
  },
  resolve: async (_source, { projectName, sprintNumber }) => {
    return db.Sprint.findOne({ where: { projectName, sprintNumber } });
  },
};