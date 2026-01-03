'use strict';
const { GraphQLInt, GraphQLNonNull, GraphQLString } = require('graphql');
const TaskPageType = require('../types/taskPageType');
const db = require('../../models');

const MAX_LIMIT = 100;

module.exports = {
  type: TaskPageType,
  args: {
    projectName: { type: new GraphQLNonNull(GraphQLString) },
    sprintNumber: { type: new GraphQLNonNull(GraphQLString) },
    offset: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  },
  resolve: async (_source, { projectName, sprintNumber, offset = 0, limit = 20 }) => {
    if (offset < 0) offset = 0;
    if (limit <= 0) limit = 20;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const includes = [];
    includes.push({ model: db.User, as: 'reporter', attributes: ['userID', 'username', 'email'] });
    includes.push({ model: db.User, as: 'assignee', attributes: ['userID', 'username', 'email'] });
    includes.push({ model: db.Sprint, as: 'sprint', attributes: ['sprintID', 'number'] });
    includes.push({ model: db.Project, as: 'project', attributes: ['projectID', 'name'] });

    const where = { projectName, sprintNumber };
    const totalCount = await db.Task.count({ where });
    const items = await db.Task.findAll({ where, include: includes, limit, offset });
    const hasMore = offset + items.length < totalCount;
    return { items, totalCount, hasMore };
  },
};
