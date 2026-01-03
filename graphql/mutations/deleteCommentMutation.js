'use strict';
const { GraphQLNonNull, GraphQLString, GraphQLInt } = require('graphql');
const UpdateCommentInput = require('../inputTypes/updateCommentInput');
const db = require('../../models');

module.exports = {
  type: GraphQLString,
  args: {
    commentID: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: async (_source, { commentID }) => {
    const comment = await db.Comment.findByPk(commentID);
    if (!comment) throw new Error('Comment not found');

    await comment.destroy();
    return `Comment ${commentID} deleted`;
  },
};
