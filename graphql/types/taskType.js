'use strict';
const { GraphQLObjectType, GraphQLInt, GraphQLString } = require('graphql');

const TaskType = new GraphQLObjectType({
  name: 'Task',
  fields: {
    taskID: { type: GraphQLInt },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    reporterUserID: { type: GraphQLInt },
    assigneeUserID: { type: GraphQLInt },
    projectID: { type: GraphQLInt },
    sprintID: { type: GraphQLInt },
    reporter: {
      type: require('./userType'),
      resolve: (task) => task.reporter || null,
    },
    assignee: {
      type: require('./userType'),
      resolve: (task) => task.assignee || null,
    },
    sprint: {
      type: require('./sprintType'),
      resolve: (task) => task.sprint || null,
    },
    // project nested field can be enabled when Project type/model exists
    // project: { type: require('./projectType'), resolve: (task) => task.project || null },
  },
});

module.exports = TaskType;
