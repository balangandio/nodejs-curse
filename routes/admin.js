const express = require('express');

const router = express.Router();

const products = [];

router.get('/add-product', (req, res, next) => {
    res.render('add-product', {
        pageTitle: 'Add Product', path: '/admin/add-product',
        formsCSS: true, activeAddProduct: true
    });
});

router.post('/add-product', (req, res, next) => {
    products.push(req.body.title);
    res.redirect('/');
});

module.exports = {
    router,
    products
};