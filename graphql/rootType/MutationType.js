const { GraphQLObjectType } = require('graphql');
const register = require('../mutations/registerMutation');
const login = require('../mutations/loginMutation');
const addRoleToUser = require('../mutations/addRoleToUserMutation');
const createSprint = require('../mutations/createSprint');
const updateSprint = require('../mutations/updateSprint');
const deleteSprint = require('../mutations/deleteSprint');
const createTask = require('../mutations/createTask');
const updateTask = require('../mutations/updateTask');
const deleteTask = require('../mutations/deleteTask');


const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    register,
    login,
    addRoleToUser,
    createSprint,
    updateSprint,
    deleteSprint,
    createTask,
    updateTask,
    deleteTask,
  },
});

module.exports = MutationType;
