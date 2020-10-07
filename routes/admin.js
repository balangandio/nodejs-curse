const express = require('express');

const isAuth = require('../middleware/is-auth');
const adminCtrl = require('../controllers/admin');


const router = express.Router();

router.get('/add-product', isAuth, adminCtrl.getAddProduct);
router.post('/add-product', isAuth, adminCtrl.postAddProduct);

router.get('/products', isAuth, adminCtrl.getProducts);

router.get('/edit-product/:productId', isAuth, adminCtrl.getEditProduct);
router.post('/edit-product', isAuth, adminCtrl.postEditProduct);

router.post('/delete-product', isAuth, adminCtrl.postDeleteProduct);

module.exports = {
    router
};