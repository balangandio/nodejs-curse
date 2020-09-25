const express = require('express');

const adminCtrl = require('../controllers/admin');


const router = express.Router();

router.get('/add-product', adminCtrl.getAddProduct);
router.post('/add-product', adminCtrl.postAddProduct);

router.get('/products', adminCtrl.getProducts);

router.get('/edit-product/:productId', adminCtrl.getEditProduct);
router.post('/edit-product', adminCtrl.postEditProduct);

router.post('/delete-product', adminCtrl.postDeleteProduct);

module.exports = {
    router
};