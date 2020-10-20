const jwt = require('jsonwebtoken');


const SERVER_JWT_TOKEN_KEY = 'secret-private-key';

exports.SERVER_JWT_TOKEN_KEY = SERVER_JWT_TOKEN_KEY;

exports.isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const err = new Error('Not authenticated!');
        err.statusCode = 401;
        throw err;
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, SERVER_JWT_TOKEN_KEY);
    } catch(err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const err = new Error('Not authenticated!');
        err.statusCode = 401;
        throw err;
    }

    req.userId = decodedToken.userId;
    next();
};