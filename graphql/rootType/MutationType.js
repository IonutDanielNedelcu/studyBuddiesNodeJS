const { GraphQLObjectType } = require('graphql');
const register = require('../mutations/registerMutation');
const login = require('../mutations/loginMutation');
const addRoleToUser = require('../mutations/addRoleToUserMutation');
const createSprint = require('../mutations/createSprint');
const updateSprint = require('../mutations/updateSprint');
const deleteSprint = require('../mutations/deleteSprint');


const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    register,
    login,
    addRoleToUser,
    createSprint,
    updateSprint,
    deleteSprint,
  },
});

module.exports = MutationType;
