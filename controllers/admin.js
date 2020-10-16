const path = require('path');

const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator');

const { deleteFile } = require('../util/file');
const Product = require('../models/product');
const { defaultImage } = require('../models/default');


const deleteProductImageFile = (imageUrl) => {
    if (filePath.indexOf('data:image') !== 0) {
        deleteFile(path.join('uploaded-images', imageUrl));
    }
};


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
        description
    } = req.body;

    const image = req.file;

    const errors = validationResult(req);

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return redirect('/');
            }

            if (!errors.isEmpty()) {
                if (image) {
                    deleteFile(image.path);
                }

                return res.status(422).render('admin/edit-product', {
                    path: '/admin/edit-product',
                    pageTitle: 'Edit Product',
                    errorMessage: errors.array()[0].msg,
                    validationErrors: errors.array(),
                    product: { _id: productId, title, price, description },
                    hasErrors: true,
                    editing: true
                });
            }

            product.title = title;
            product.price = price;
            if (image) {
                deleteProductImageFile(product.imageUrl);
                product.imageUrl = image.filename;
            }
            product.description = description;

            return product.save().then(() => {
                res.redirect('/admin/products');
            });
        }).catch(err => next(new Error(err)));
};

exports.postAddProduct = (req, res, next) => {
    const { title, description, price } = req.body;
    let image = req.file ? req.file.filename : defaultImage;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        if (req.file) {
            deleteFile(req.file.path);
        }

        return res.status(422).render('admin/edit-product', {
            path: '/admin/edit-product',
            pageTitle: 'Add Product',
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: { title, description, price },
            editing: false,
            hasErrors: true
        });
    }

    const product = new Product({ title, price, description, imageUrl: image, userId: req.user });

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

exports.deleteProduct = (req, res, next) => {
    const { productId } = req.params;

    Product.findById(productId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found!'));
            }

            return Product.deleteOne({ _id: new ObjectId(productId), userId: req.user._id })
                .then(() => {
                    deleteProductImageFile(product.imageUrl);
                    
                    res.status(200).json({ message: 'Success!' });
                });
        }).catch(err => res.status(500).json({ message: 'Deletion failed!' }));
};
