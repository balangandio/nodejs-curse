const express = require('express');
const { check, body } = require('express-validator');

const authCtrl = require('../controllers/auth');
const User = require('../models/user');


const router = express.Router();

router.get('/login', authCtrl.getLogin);
router.get('/signup', authCtrl.getSignup);
router.post(
    '/login',
    [
        body('email')
            .isEmail().withMessage('Enter a valid e-mail!'),
        body('password', 'Password invalid!')
            .isLength({ min: 3 }).isAlphanumeric().trim()
    ],
    authCtrl.postLogin
);
router.post(
    '/signup',
    [ 
        check('email')
            .isEmail().withMessage('Enter a valid e-mail!')
            .custom((email, { req }) => {
                return User.findOne({ email })
                    .then(user => {
                        if (user) {
                            return Promise.reject('E-mail already been in use!')
                        }
                    });
            }),
        body('password', 'Password invalid!')
            .isLength({ min: 3 }).isAlphanumeric().trim(),
        body('confirmPassword').trim().custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Confirm password mismatch!');
            }

            return true;
        }),
    ],
    authCtrl.postSignup
);
router.post('/logout', authCtrl.postLogout);
router.get('/reset', authCtrl.getReset);
router.post('/reset', authCtrl.postReset);
router.get('/reset/:token', authCtrl.getNewPassword);
router.post('/new-password', authCtrl.postNewPassword);

module.exports = {
    router
};