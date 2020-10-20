const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { SERVER_JWT_TOKEN_KEY } = require('../middleware/is-auth');
const User = require('../models/user');


const createPasswordHash = (password) => {
    return bcrypt.hash(password, 12);
};


exports.signup = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Invalid input data');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { email, name, password } = req.body;

    createPasswordHash(password).then(hash => {
        const user = new User({
            email,
            password: hash,
            name
        });

        return user.save();
    }).then(result => {
        res.status(201).json({
            message: 'User created!',
            userId: result._id
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.login = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Invalid input data');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                const error = new Error('Invalid email or password.');
                error.statusCode = 401;
                throw error;
            }

            return bcrypt.compare(password, user.password)
                .then(samePwd => { return { user, samePwd }; });
        }).then(({ user, samePwd}) => {
            if (!samePwd) {
                const error = new Error('Invalid email or password.');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign(
                {
                    email: user.email,
                    userId: user._id.toString()
                },
                SERVER_JWT_TOKEN_KEY,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                message: 'Authetication succeed',
                token,
                userId: user._id.toString()
            })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};