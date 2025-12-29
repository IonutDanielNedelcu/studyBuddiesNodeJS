const { GraphQLObjectType, GraphQLString } = require('graphql');
const roles = require('../queries/rolesQuery');
const role = require('../queries/roleQuery');
const users = require('../queries/usersQuery');
const me = require('../queries/meQuery');
const sprints = require('../queries/sprintsQuery');
const sprintsFromProject = require('../queries/sprintsFromProjectQuery');
const sprint = require('../queries/sprintQuery');
const tasks = require('../queries/tasksQuery');
const task = require('../queries/taskQuery');
const tasksFromSprint = require('../queries/tasksFromSprintQuery');
const tasksFromProject = require('../queries/tasksFromProjectQuery');
const tasksOfEmployee = require('../queries/tasksOfEmployeeQuery');
const tasksWithStatus = require('../queries/tasksWithStatusQuery');


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
    tasks,
    tasksFromSprint,
    task,
    tasksFromProject,
    tasksOfEmployee,
    tasksWithStatus,
  },
});

module.exports = QueryType;
