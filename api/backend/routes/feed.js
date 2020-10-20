const express = require('express');
const { body } = require('express-validator');

const { isAuth } = require('../middleware/is-auth');
const feedCtrl = require('../controllers/feed');


const router = express.Router();

router.get('/posts', isAuth, feedCtrl.getPosts);

router.post('/post', isAuth, [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], feedCtrl.postPost);

router.get('/post/:postId', isAuth, feedCtrl.getPost);

router.put('/post/:postId', isAuth, [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], feedCtrl.putPost);

router.delete('/post/:postId', isAuth, feedCtrl.deletePost);

module.exports = router;