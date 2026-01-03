const { GraphQLObjectType } = require('graphql');
const register = require('../mutations/registerMutation');
const login = require('../mutations/loginMutation');
const addRoleToUser = require('../mutations/addRoleToUserMutation');
const logout = require('../mutations/logoutMutation');
const removeUser = require('../mutations/removeUserMutation');
const removeRoleFromUser = require('../mutations/removeRoleFromUserMutation');
const createPosition = require('../mutations/createPositionMutation');
const addPositionToUser = require('../mutations/addPositionToUserMutation');
const removePositionFromUser = require('../mutations/removePositionFromUserMutation');
const removePosition = require('../mutations/removePositionMutation');
const createSprint = require('../mutations/createSprintMutation');
const updateSprint = require('../mutations/updateSprintMutation');
const deleteSprint = require('../mutations/deleteSprintMutation');
const createTask = require('../mutations/createTaskMutation');
const updateTask = require('../mutations/updateTaskMutation');
const deleteTask = require('../mutations/deleteTaskMutation');
const createComment = require('../mutations/createCommentMutation');
const updateComment = require('../mutations/updateCommentMutation');
const deleteComment = require('../mutations/deleteCommentMutation');


const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    register,
    login,
    addRoleToUser,
    logout,
    removeUser,
    removeRoleFromUser,
    createPosition,
    addPositionToUser,
    removePositionFromUser,
    removePosition,
    createSprint,
    updateSprint,
    deleteSprint,
    createTask,
    updateTask,
    deleteTask,
    createComment,
    updateComment,
    deleteComment,
  },
});

module.exports = MutationType;
