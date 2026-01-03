const { GraphQLList, GraphQLNonNull, GraphQLString } = require('graphql');
const PositionType = require('../types/positionType');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
  type: new GraphQLList(PositionType),
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_source, { name }, context) => {
    authorizeRoles(context, ['Admin', 'Manager']);
    return db.Position.findAll({ where: { name } });
  },
};
