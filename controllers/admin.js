const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator/check');

const Product = require('../models/product');
const { defaultImage } = require('../models/default');


exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        product: null,
        hasErrors: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.getEditProduct = (req, res, next) => {
    const id = req.params.productId;
    const editMode = req.query.edit;

    Product.findById(id).then(product => {
        if (!product) {
            return res.redirect('/');
        }

        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product,
            hasErrors: false,
            errorMessage: null,
            validationErrors: []
        });
    }).catch(err => next(new Error(err)));
};

exports.postEditProduct = (req, res, next) => {
    const {
        productId,
        title,
        price,
        imageUrl,
        description
    } = req.body;

    const errors = validationResult(req);

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return redirect('/');
            }

            if (!errors.isEmpty()) {
                return res.status(422).render('admin/edit-product', {
                    path: '/admin/edit-product',
                    pageTitle: 'Edit Product',
                    errorMessage: errors.array()[0].msg,
                    validationErrors: errors.array(),
                    product: { _id: productId, title, price, imageUrl, description },
                    hasErrors: true,
                    editing: true
                });
            }

            product.title = title;
            product.price = price;
            product.imageUrl = imageUrl;
            product.description = description;

            return product.save().then(() => {
                res.redirect('/admin/products');
            });
        }).catch(err => next(new Error(err)));
};

exports.postAddProduct = (req, res, next) => {
    let { title, description, price, imageUrl } = req.body;

    if (!imageUrl) {
        imageUrl = defaultImage;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            path: '/admin/edit-product',
            pageTitle: 'Add Product',
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: { title, description, price, imageUrl: imageUrl !== defaultImage ? imageUrl : '' },
            editing: false,
            hasErrors: true
        });
    }

    const product = new Product({ title, price, description, imageUrl, userId: req.user });

    product.save().then(() => {
        res.redirect('/');
    }).catch(err => next(new Error(err)));
};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render('admin/products', {
                prods: products, pageTitle: 'All Products', path: '/admin/products'
            });
        }).catch(err => next(new Error(err)));
};

exports.postDeleteProduct = (req, res, next) => {
    const { productId } = req.body;

    Product.deleteOne({ _id: new ObjectId(productId), userId: req.user._id })
        .then(() => res.redirect('/admin/products'))
        .catch(err => next(new Error(err)));
};
