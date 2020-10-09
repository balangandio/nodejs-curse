const crypto = require('crypto');

const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const { ObjectId } = require('mongodb');


const createPasswordHash = (password) => {
    return bcrypt.hash(password, 12);
};

const sendEmail = ({subject, text, html, to}) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: 'username@gmail.com', pass: 'password' },
    });

    return transporter.sendMail({
        from: '"NodeJS Curse App" <username@gmail.com>',
        to, subject, text, html
    });
};

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error'),
        infoMessage: req.flash('info'),
        validationErrors: [],
        oldInput: false
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error'),
        oldInput: false,
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;

    const errors = validationResult(req);

    const renderError = (msg) => {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: msg,
            infoMessage: false,
            validationErrors: errors.array(),
            oldInput: { email }
        });
    };

    if (!errors.isEmpty()) {
        return renderError(errors.array()[0].msg);
    }

    User.findOne({ email })
        .then(user => {
            return bcrypt.compare(password, user.password)
                .then(samePwd => { return { user, samePwd }; });
        }).then(({ user, samePwd}) => {
            if (!samePwd) {
                return renderError('Invalid email or password.');
            }

            req.session.isLoggedIn = true;
            req.session.user = user;

            req.session.save(err => {
                res.redirect('/');
            });
        }).catch(err => next(new Error(err)));
};

exports.postSignup = (req, res, next) => {
    const { email, password, name } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            oldInput: { email, name }
        });
    }

    return createPasswordHash(password)
        .then(password => new User({ name, email, password, cart: { items: [] } }).save())
        .then(() => {
            res.redirect('/login');
            /*return sendEmail({
                subject: 'Signup',
                text: 'Your account has be created',
                to: email
            });*/
        }).catch(err => next(new Error(err)));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error'),
        infoMessage: req.flash('info')
    });
};

exports.postReset = (req, res, next) => {
    const { email } = req.body;

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            req.flash('error', 'Error on preparing your reset: ' + err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        return User.findOne({ email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with the specified e-mail was found.');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;

                return user.save()
                    .then(user => {
                        return sendEmail({
                            to: email,
                            subject: 'Password Reset',
                            html: `
                                <p>Your requested a password reset:</p>
                                <a href="http://localhost:3000/reset/${token}">link</a>
                            `
                        });
                    }).then(() => {
                        req.flash('info', 'Reset link was sended to your e-mail!');
                        return res.redirect('/reset');
                    });
            }).catch(err => next(new Error(err)));
    });
};

exports.getNewPassword = (req, res, next) => {
    const { token } = req.params;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            res.render('auth/new-password', {
                path: '/reset',
                pageTitle: 'New Password',
                errorMessage: user ? req.flash('error') : 'User not found!',
                userId: user ? user._id.toString() : '',
                token
            });
        });
};

exports.postNewPassword = (req, res, next) => {
    const { userId, token, password } = req.body;

    User.findOne({
        _id: userId ? new ObjectId(userId) : undefined,
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() } 
    }).then(user => {
        if (!user) {
            req.flash('error', 'Requested user was not found!');
            return res.redirect('/reset');
        }

        createPasswordHash(password).then(hash => {
            user.password = hash;
            user.resetToken = user.resetTokenExpiration = undefined;
            return user.save();
        }).then(() => {
            req.flash('info', 'Password reset successfully!')
            res.redirect('/login');
        });
    }).catch(err => next(new Error(err)));
};