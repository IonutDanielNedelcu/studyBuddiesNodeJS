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
const sprints = require('../queries/sprintsQuery');
const sprintsFromProject = require('../queries/sprintsFromProjectQuery');
const sprint = require('../queries/sprintQuery');
const tasks = require('../queries/tasksQuery');
const task = require('../queries/taskQuery');
const tasksFromSprint = require('../queries/tasksFromSprintQuery');
const tasksFromProject = require('../queries/tasksFromProjectQuery');
const tasksOfEmployee = require('../queries/tasksOfEmployeeQuery');
const tasksWithStatus = require('../queries/tasksWithStatusQuery');
const comments = require('../queries/commentsQuery');
const comment = require('../queries/commentQuery');
const commentsByTask = require('../queries/commentsByTaskQuery');
const commentsOfEmployee = require('../queries/commentsOfEmployeeQuery');


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
    sprints,
    sprintsFromProject,
    sprint,
    tasks,
    tasksFromSprint,
    task,
    tasksFromProject,
    tasksOfEmployee,
    tasksWithStatus,
    comments,
    commentsByTask,
    comment,
    commentsOfEmployee,
  },
});

module.exports = QueryType;
