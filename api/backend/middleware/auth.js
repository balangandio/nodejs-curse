const jwt = require('jsonwebtoken');


const SERVER_JWT_TOKEN_KEY = 'secret-private-key';

exports.SERVER_JWT_TOKEN_KEY = SERVER_JWT_TOKEN_KEY;

exports.isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        req.isAuth = false;
        return next();
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, SERVER_JWT_TOKEN_KEY);
    } catch(err) {
        req.isAuth = false;
        return next();
    }

    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }

    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
};