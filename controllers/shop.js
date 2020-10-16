const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe  = require('stripe')('pk_test_i6b537msoXqRsJFwQwCm9tR1');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;


exports.getProducts = (req, res, next) => {
    const page = req.query.page ? Number(req.query.page) : 1;

    Product.collection
        .countDocuments()
        .then(total => {
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .then(products => { return { products, total }; });
        }).then(({ products, total }) => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < total,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(total / ITEMS_PER_PAGE)
            });
        }).catch(err => next(new Error(err)));
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
        }).catch(err => next(new Error(err)));
};

exports.getIndex = (req, res, next) => {
    const page = req.query.page ? Number(req.query.page) : 1;

    Product.collection
        .countDocuments()
        .then(total => {
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .then(products => { return { products, total }; });
        }).then(({ products, total }) => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < total,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(total / ITEMS_PER_PAGE)
            });
        }).catch(err => next(new Error(err)));
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;

            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products
            });
        })
        .catch(err => next(new Error(err)));
};

exports.postCart = (req, res, next) => {
    const id = req.body.productId;

    Product.findById(id)
        .then(product => req.user.addToCart(product))
        .then(() => {
            res.redirect('/cart');
        }).catch(err => next(new Error(err)));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const id = req.body.productId;

    req.user.removeFromCart(id)
        .then(() => {
            res.redirect('/cart');
        }).catch(err => next(new Error(err)));
};

exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            const totalSum = products.reduce((sum, p) => {
                return sum + (p.quantity * p.productId.price);
            }, 0);

            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                path: '/checkout',
                products,
                totalSum
            });
        }).catch(err => next(new Error(err)));
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Orders',
                path: '/orders',
                orders
            });
        })
        .catch(err => next(new Error(err)));
};

exports.postOrder = (req, res, next) => {
    const { stripeToken } = req.body;

    const createCharge = (totalSum, token, orderId) => {
        return stripe.charges.create({
            amount: totalSum * 100,
            currency: 'usd',
            description: 'Demo Order',
            source: token,
            metadata: { order_id: orderId }
        });
    };

    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => user.cart.items)
        .then(cartPoducts => {
            const products = cartPoducts.map(item => {
                return { quantity: item.quantity, product: { ...item.productId._doc } };
            });

            const totalSum = products.reduce((sum, p) => {
                return sum + (p.quantity * p.product.price)
            }, 0);

            const newOrder = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products
            });

            return newOrder.save().then(order => { return { totalSum, order }; });
        }).then(({ totalSum, order }) => {
            req.user.clearCart();

            //const charge = createCharge(totalSum, stripeToken, order._id.toString());
        }).then(() => {
            res.redirect('/orders');
        }).catch(err => next(new Error(err)));
};

exports.getInvoice = (req, res, next) => {
    const { orderId } = req.params;

    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('No order found!'));
        }

        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Not allowed!'));
        }

        const invoiceName = `invoice-${orderId}.pdf`;

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(res);
        
        pdfDoc.fontSize(26).text('Invoice', { underline: true });
        pdfDoc.text('-----------------------');

        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price;
            pdfDoc.fontSize(14).text(
                `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
            );
        });
        
        pdfDoc.text('---');
        pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
    
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
        pdfDoc.end();
    }).catch(next);
};