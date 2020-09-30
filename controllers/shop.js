const Product = require('../models/product');
//const Order = require('../models/order');


exports.getProducts = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('shop/product-list', {
            prods: products, pageTitle: 'All Products', path: '/products'
        });
    }).catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product,
                pageTitle: 'Detail',
                path: '/products'
            });
        }).catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('shop/index', {
            prods: products, pageTitle: 'Shop', path: '/'
        });
    }).catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(products => {
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products
            });
        })
        .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
    const id = req.body.productId;

    Product.findById(id)
        .then(product => req.user.addToCart(product))
        .then(() => {
            res.redirect('/cart');
        }).catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const id = req.body.productId;

    req.user.deleteItemFromCart(id)
        .then(() => {
            res.redirect('/cart');
        }).catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout', path: '/checkout'
    });
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Orders',
                path: '/orders',
                orders
            });
        })
        .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user.addOrder()
        .then(() => {
            res.redirect('/orders');
        }).catch(err => console.log(err));
};
