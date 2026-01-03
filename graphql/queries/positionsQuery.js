const { GraphQLList } = require('graphql');
const PositionType = require('../types/positionType');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
  type: new GraphQLList(PositionType),
  resolve: async (_source, _args, context) => {
    authorizeRoles(context, ['Admin', 'Manager']);
    return db.Position.findAll();
  },
};
