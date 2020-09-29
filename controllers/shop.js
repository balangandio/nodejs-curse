const Product = require('../models/product');
const Order = require('../models/order');


exports.getProducts = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/product-list', {
            prods: products, pageTitle: 'All Products', path: '/products'
        });
    }).catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findAll({ where: {id: prodId} })
        .then(products => {
            res.render('shop/product-detail', {
                product: products[0],
                pageTitle: 'Detail',
                path: '/products'
            });
        }).catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/index', {
            prods: products, pageTitle: 'Shop', path: '/'
        });
    }).catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart => cart.getProducts())
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

    req.user.getCart()
        .then(cart => cart.getProducts({ where: {id} })
            .then(products => new Object({cart, products})))
        .then(({ cart, products }) => {
            if (products.length > 0) {
                const product = products[0];
                const quantity = product.cartItem.quantity + 1;

                return new Object({ cart, product, quantity });
            }
            
            return Product.findAll({where: {id}})
                .then(products => new Object({cart, product: products[0], quantity: 1}));
        }).then(({ cart, product, quantity }) => {
            return cart.addProduct(product, {
                through: { quantity }
            });
        }).then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const id = req.body.productId;

    req.user.getCart()
        .then(cart => cart.getProducts({where: {id}})
        .then(elems => elems[0]))
        .then(product => product.cartItem.destroy())
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
    req.user.getCart()
        .then(cart => cart.getProducts()
            .then(products => new Object({ cart, products })))
        .then(({ cart, products }) => req.user.createOrder()
            .then(order => new Object({ cart, order, products })))
        .then(({ cart, order, products }) => {
            return order.addProducts(products.map(product => {
                product.orderItem = { quantity: product.cartItem.quantity };

                return product;
            })).then(() => cart.setProducts(null));
        }).then(() => {
            res.redirect('/orders');
        }).catch(err => console.log(err));
};
