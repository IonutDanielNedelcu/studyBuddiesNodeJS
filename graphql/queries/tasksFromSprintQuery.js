const { GraphQLList, GraphQLNonNull, GraphQLString } = require('graphql');
const TaskType = require('../types/taskType');
const db = require('../../models');

module.exports = {
  type: new GraphQLList(TaskType),
  args: {
    projectName: { type: new GraphQLNonNull(GraphQLString) },
    sprintNumber: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_source, { sprintNumber, projectName }) => {
    if (sprintNumber == null || projectName == null) return [];

    const includes = [];
    includes.push({ model: db.User, as: 'reporter', attributes: ['userID', 'username', 'email'] });
    includes.push({ model: db.User, as: 'assignee', attributes: ['userID', 'username', 'email'] });
    includes.push({ model: db.Sprint, as: 'sprint', attributes: ['sprintID', 'number'] });
    // TODO: uncomment
    //includes.push({ model: db.Project, as: 'project', attributes: ['projectID', 'name'] });

    return db.Task.findAll({ where: { sprintNumber, projectName }, include: includes });
  },
};
