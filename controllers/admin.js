const Product = require('../models/product');
const { defaultImage } = require('../models/default');


exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId;
    const editMode = req.query.edit;

    Product.findById(prodId).then(product => {
        if (!product) {
            return res.redirect('/');
        }

        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product
        });
    }).catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const {
        productId,
        title,
        price,
        imageUrl,
        description
    } = req.body;

    const product = new Product({id: productId, title, imageUrl, description, price});

    product.save().then(() => {
        res.redirect('/admin/products');
    }).catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
    let { title, description, price, imageUrl } = req.body;

    if (!imageUrl) {
        imageUrl = defaultImage;
    }

    const product = new Product({id: null, title, imageUrl, description, price});
    product.save().then(() => {
        res.redirect('/');
    }).catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('admin/products', {
            prods: products, pageTitle: 'All Products', path: '/admin/products'
        });
    }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const { productId } = req.body;

    Product.findById(productId)
        .then(product => product.delete())
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};
