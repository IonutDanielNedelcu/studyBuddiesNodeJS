const { GraphQLObjectType, GraphQLString } = require('graphql');
const roles = require('../queries/rolesQuery');
const role = require('../queries/roleQuery');
const users = require('../queries/usersQuery');
const me = require('../queries/meQuery');
const sprints = require('../queries/sprintsQuery');
const sprintsFromProject = require('../queries/sprintsFromProjectQuery');
const sprint = require('../queries/sprintQuery');


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
    role,
    sprints,
    sprintsFromProject,
    sprint,
  },
});

module.exports = QueryType;
