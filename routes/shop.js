const express = require('express');

const shopCtrl = require('../controllers/shop');


const router = express.Router();

router.get('/', shopCtrl.getIndex);
router.get('/products', shopCtrl.getProducts);

router.get('/products/:productId', shopCtrl.getProduct);

router.get('/cart', shopCtrl.getCart);

router.post('/cart', shopCtrl.postCart);

router.post('/cart-delete-item', shopCtrl.postCartDeleteProduct);

router.get('/checkout', shopCtrl.getCheckout);
router.get('/orders', shopCtrl.getOrders);

module.exports = router;