const { GraphQLObjectType, GraphQLString } = require('graphql');
const roles = require('../queries/rolesQuery');
const role = require('../queries/roleQuery');
const users = require('../queries/usersQuery');
const me = require('../queries/meQuery');
const positions = require('../queries/positionsQuery');
const positionsBySeniority = require('../queries/positionsBySeniorityQuery');
const positionsByName = require('../queries/positionsByNameQuery');
const teams = require('../queries/teamsQuery');
const teamByName = require('../queries/teamByNameQuery');
const userByUsername = require('../queries/userByUsernameQuery');

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    ping: {
      type: GraphQLString,
      resolve: () => 'pong',
    },
    roles,
    users,
    me,
    positions,
    positionsBySeniority,
    positionsByName,
    teams,
    teamByName,
    userByUsername,
    role,
  },
});

module.exports = QueryType;
