const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt } = require('graphql');

const RegisterInputType = new GraphQLInputObjectType({
  name: 'RegisterInput',
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    positionID: { type: GraphQLInt },
    teamID: { type: GraphQLInt },
  },
});

module.exports = RegisterInputType;
