const express = require('express');

const authCtrl = require('../controllers/auth');


const router = express.Router();

router.get('/login', authCtrl.getLogin);
router.post('/login', authCtrl.postLogin);
router.post('/logout', authCtrl.postLogout);

module.exports = {
    router
};