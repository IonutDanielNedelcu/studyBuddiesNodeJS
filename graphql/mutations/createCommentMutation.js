'use strict';
const { GraphQLNonNull } = require('graphql');
const CommentType = require('../types/commentType');
const CreateCommentInput = require('../inputTypes/createCommentInput');
const db = require('../../models');

module.exports = {
  type: CommentType,
  args: {
    input: { type: new GraphQLNonNull(CreateCommentInput) },
  },
  resolve: async (_source, { input }, context) => {
    // Determine creator from context
    const viewer = context && context.user;
    if (!viewer) throw new Error('Not authenticated');

    // ensure task exists
    const task = await db.Task.findByPk(input.taskID);
    if (!task) throw new Error('Task not found');

    // date is set server-side to the current timestamp
    const comment = await db.Comment.create({
      text: input.text,
      date: new Date(),
      userID: viewer.userID || viewer.id,
      taskID: input.taskID,
    });

    const includes = [];
    if (db.User) includes.push({ model: db.User, as: 'user', attributes: ['userID', 'username', 'email'] });
    if (db.Task) includes.push({ model: db.Task, as: 'task', attributes: ['taskID', 'name'] });

    return db.Comment.findByPk(comment.commentID, { include: includes });
  },
};
