const jwt = require("jsonwebtoken");

const db = require('../models');

const { JWT_SECRET_KEY } = require('../constants');

const jwtMiddleware = async (request, response, next) => {
    const authorizationHeader = request.headers.authorization;

    if(!authorizationHeader) {
        next();
        return;
    }

    const token = authorizationHeader.replace("Bearer ", "");

    try {
        const payload = jwt.verify(token, JWT_SECRET_KEY);
        const subjectId = payload.sub;
        const user = await db.User.findByPk(subjectId);

        if (!user) {
            console.error("No user found for the given token!");
            next();
            return;
        }

        request.userData = user;

    } catch(e) {
        console.log("Invalid token encountered");
    }

    next();
}


module.exports = jwtMiddleware;
