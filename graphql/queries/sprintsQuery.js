const { GraphQLList } = require('graphql');
const SprintType = require('../types/sprintType');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
    type: new GraphQLList(SprintType),
    resolve: async (_source, _args, context) => {
        authorizeRoles(context, ['Admin', 'Manager']);
        // TODO: add project details when Project model is created
        const sprints = await db.Sprint.findAll();
        return sprints;
    },
};