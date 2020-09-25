const express = require('express');

const { get404 } = require('../controllers/error');


const router = express.Router();

router.use(get404);

module.exports = router;