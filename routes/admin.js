const path = require('path');
const rootPath = require('../util/path');

const express = require('express');

const router = express.Router();

router.get('/add-product', (req, res, next) => {
    res.sendFile(path.join(rootPath, 'views','add-product.html'));
});

router.post('/add-product', (req, res, next) => {
    console.log(req.body);
    res.redirect('/');
});

module.exports = router;