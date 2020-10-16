const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const adminCtrl = require('../controllers/admin');


const router = express.Router();

router.get('/add-product', isAuth, adminCtrl.getAddProduct);
router.post(
    '/add-product',
    isAuth,
    [
        body('title').isString().isLength({ min: 3 }).trim(),
        body('price').isFloat(),
        body('description').isLength({ min: 3, max: 400 }).trim()
    ],
    adminCtrl.postAddProduct
);

router.get('/products', isAuth, adminCtrl.getProducts);

router.get('/edit-product/:productId', isAuth, adminCtrl.getEditProduct);
router.post(
    '/edit-product',
    isAuth,
    [
        body('title').isString().isLength({ min: 3 }).trim(),
        body('price').isFloat(),
        body('description').isLength({ min: 3, max: 400 }).trim()
    ],
    adminCtrl.postEditProduct
);

router.delete('/product/:productId', isAuth, adminCtrl.deleteProduct);

module.exports = {
    router
};