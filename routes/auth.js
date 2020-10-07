const express = require('express');

const authCtrl = require('../controllers/auth');


const router = express.Router();

router.get('/login', authCtrl.getLogin);
router.get('/signup', authCtrl.getSignup);
router.post('/login', authCtrl.postLogin);
router.post('/signup', authCtrl.postSignup);
router.post('/logout', authCtrl.postLogout);

module.exports = {
    router
};