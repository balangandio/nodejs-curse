const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const the404Routers = require('./routes/404');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(shopRoutes);
app.use('/admin', adminRoutes.router);
app.use(the404Routers);

const port = 3000;

console.log(`<-> Listening on port: ${port}`);
app.listen(port);
