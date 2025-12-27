const { GraphQLSchema } = require('graphql');

const QueryType = require('./rootType/mockQueryType');
const MutationType = require('./rootType/mockMutationType');

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});

module.exports = schema;