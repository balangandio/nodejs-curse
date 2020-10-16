const express = require('express');

const isAuth = require('../middleware/is-auth');
const shopCtrl = require('../controllers/shop');


const router = express.Router();

router.get('/', shopCtrl.getIndex);
router.get('/products', shopCtrl.getProducts);

router.get('/products/:productId', shopCtrl.getProduct);

router.get('/cart', isAuth, shopCtrl.getCart);

router.post('/cart', isAuth, shopCtrl.postCart);

router.post('/cart-delete-item', isAuth, shopCtrl.postCartDeleteProduct);

router.get('/checkout', isAuth, shopCtrl.getCheckout);

router.get('/orders', isAuth, shopCtrl.getOrders);

router.get('/orders/:orderId', isAuth, shopCtrl.getInvoice);

module.exports = router;