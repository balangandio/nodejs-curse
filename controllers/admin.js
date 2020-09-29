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
    const id = req.params.productId;
    const editMode = req.query.edit;

    req.user.getProducts({where: {id}}).then(products => {
        const product = products[0];

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

    Product.findAll({where: {id: productId}})
        .then(products => products[0])
        .then(product => {
            product.title = title;
            product.price = price;
            product.imageUrl = imageUrl;
            product.description = description;

            return product.save();
        }).then(() => {
            res.redirect('/admin/products');
        }).catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
    let { title, description, price, imageUrl } = req.body;

    if (!imageUrl) {
        imageUrl = defaultImage;
    }

    req.user.createProduct({
        title,
        price,
        imageUrl,
        description
    }).then(() => {
        res.redirect('/');
    }).catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    req.user.getProducts()
        .then(products => {
            res.render('admin/products', {
                prods: products, pageTitle: 'All Products', path: '/admin/products'
            });
        }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const { productId } = req.body;

    Product.findAll({ where: {id: productId} })
        .then(products => products[0])
        .then(product => product.destroy())
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};
