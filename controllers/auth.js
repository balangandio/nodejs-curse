const User = require('../models/user');


exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    User.findById('5f75e0e44573fa2fb88fb20e')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;

            req.session.save(err => {
                res.redirect('/');
            });
        }).catch(console.log);
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
};