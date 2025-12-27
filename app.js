const express = require('express');
const app = express();
const port = 3009;

const { createHandler } = require('graphql-http/lib/use/http');
const schema = require('./graphql/schema');

const jwtMiddleware = require("./middlewares/jwtMiddleware");

const graphQLHandler = createHandler({
    schema,
    context: (request) => {
        return {
            user: request.raw.userData,
        }
    }
});

app.post('/graphql', jwtMiddleware, graphQLHandler);

module.exports = {
    app,
    port,
};