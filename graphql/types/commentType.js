'use strict';
const { GraphQLObjectType, GraphQLInt, GraphQLString } = require('graphql');

const CommentType = new GraphQLObjectType({
  name: 'Comment',
  fields: {
    commentID: { type: GraphQLInt },
    text: { type: GraphQLString },
    date: { 
      type: GraphQLString,
      resolve: (comment) => comment.date ? (comment.date instanceof Date ? comment.date.toISOString() : new Date(comment.date).toISOString()) : null,
    },
    userID: { type: GraphQLInt },
    taskID: { type: GraphQLInt },
    user: {
      type: require('./userType'),
      resolve: (comment) => comment.user,
    },
    task: {
      type: require('./taskType'),
      resolve: (comment) => comment.task,
    },
  },
});

module.exports = CommentType;
