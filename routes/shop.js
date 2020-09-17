const express = require('express');

const { products } = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('shop', {
        prods: products, pageTitle: 'Shop', path: '/',
        productCSS: true, activeShop: true, hasProducts: products.length > 0
    });
});

module.exports = router;