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
  },
});

module.exports = MutationType;
