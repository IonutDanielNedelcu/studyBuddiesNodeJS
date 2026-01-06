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
const projects = require('../queries/projectsQuery');
const repositories = require('../queries/repositoriesQuery');
const repositoryByName = require('../queries/repositoryByNameQuery');
const projectsByUser = require('../queries/projectsByUserQuery');
const usersByTeam = require('../queries/usersByTeamQuery');
const sprints = require('../queries/sprintsQuery');
const sprintsFromProject = require('../queries/sprintsFromProjectQuery');
const sprint = require('../queries/sprintQuery');
const sprintsPage = require('../queries/sprintsPageQuery');
const sprintsFromProjectPage = require('../queries/sprintsFromProjectPageQuery');
const tasks = require('../queries/tasksQuery');
const task = require('../queries/taskQuery');
const tasksFromSprint = require('../queries/tasksFromSprintQuery');
const tasksFromProject = require('../queries/tasksFromProjectQuery');
const tasksOfEmployee = require('../queries/tasksOfEmployeeQuery');
const tasksWithStatus = require('../queries/tasksWithStatusQuery');
const tasksPage = require('../queries/tasksPageQuery');
const tasksFromProjectPage = require('../queries/tasksFromProjectPageQuery');
const tasksFromSprintPage = require('../queries/tasksFromSprintPageQuery');
const tasksOfEmployeePage = require('../queries/tasksOfEmployeePageQuery');
const tasksWithStatusPage = require('../queries/tasksWithStatusPageQuery');
const comments = require('../queries/commentsQuery');
const comment = require('../queries/commentQuery');
const commentsByTask = require('../queries/commentsByTaskQuery');
const commentsOfEmployee = require('../queries/commentsOfEmployeeQuery');
const commentsPage = require('../queries/commentsPageQuery');
const commentsByTaskPage = require('../queries/commentsByTaskPageQuery');


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