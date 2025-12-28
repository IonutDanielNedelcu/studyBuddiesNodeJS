const UserType = require('../types/userType');

module.exports = {
  type: UserType,
  resolve: async (_source, _args, context) => {
    // context.user is set by jwtMiddleware -> app.js
    return context && context.user ? context.user : null;
  },
};
