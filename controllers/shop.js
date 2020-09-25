const Product = require('../models/product');
const Cart = require('../models/cart');


exports.getProducts = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('shop/product-list', {
            prods: products, pageTitle: 'All Products', path: '/products'
        });
    });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId).then(product => {
        res.render('shop/product-detail', {
            product,
            pageTitle: 'Detail',
            path: '/products'
        });
    });
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('shop/index', {
            prods: products, pageTitle: 'Shop', path: '/'
        });
    });
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {

        const cartProducts = cart.products.map(cartProd => {
            const props = { qty: cartProd.qty };

            props._load = Product.findById(cartProd.id).then(prod => props.productData = prod);

            return props;
        });

        cartProducts.map(prod => prod._load).reduce((prev, next) => {
            return prev.then(() => next);
        }, Promise.resolve()).then(() => {

            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            });

        });
    });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId).then(product => {
        Cart.addProduct(product.id, product.price);
    });

    res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId).then(product => {
        Cart.deleteProduct(product.id, product.price);

        res.redirect('/cart');
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout', path: '/checkout'
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Orders', path: '/orders'
    });
};
