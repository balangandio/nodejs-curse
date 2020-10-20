const express = require('express');
const { body } = require('express-validator');

const authCtrl = require('../controllers/auth');
const User = require('../models/user');


const router = express.Router();

router.put('/signup', [
    body('email').trim().isEmail()
        .withMessage('Enter the E-mail input')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-mail already in use!');
                }
            });
        }),
    body('name').trim().not().isEmpty(),
    body('password').trim().isLength({min: 3})
], authCtrl.signup);

router.post('/login', authCtrl.login);

module.exports = router;