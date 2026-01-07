const { GraphQLNonNull, GraphQLString } = require('graphql');
const RepositoryType = require('../types/repositoryType');
const db = require('../../models');
const { authorizeRoles } = require('../../utils/authorize');

module.exports = {
  type: RepositoryType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    url: { type: GraphQLString },
  },
  resolve: async (_source, { name, url }, context) => {
    authorizeRoles(context, ['Admin', 'Manager']);

    const existing = await db.Repository.findOne({ where: { name } });
    if (existing) {
      throw new Error('A repository with this name already exists');
    }

    return await db.Repository.create({ name, url });
  },
};