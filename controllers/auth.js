const bcrypt = require('bcryptjs');

const User = require('../models/user');


const createPasswordHash = (password) => {
    return bcrypt.hash(password, 12);
};

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error')
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error')
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            return bcrypt.compare(password, user.password)
                .then(samePwd => { return { user, samePwd }; });
        }).then(({ user, samePwd}) => {
            if (!samePwd) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }

            req.session.isLoggedIn = true;
            req.session.user = user;

            req.session.save(err => {
                res.redirect('/');
            });
        }).catch(console.log);
};

exports.postSignup = (req, res, next) => {
    const { email, password, name } = req.body;

    User.findOne({ email })
        .then(user => {
            if (user) {
                req.flash('error', 'E-mail address already exists');
                return res.redirect('/signup');
            }

            return createPasswordHash(password)
                .then(password => new User({ name, email, password, cart: { items: [] } }).save())
                .then(() => res.redirect('/login'));
        }).catch(console.log);
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
};