const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { mongoConnect } = require('./util/database');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const the404Routers = require('./routes/404');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    User.findById('5f74d18fc2da63000c7d6939')
        .then(user => {
            req.user = user;
            next();
        }).catch(console.log);
});


app.use(shopRoutes);
app.use('/admin', adminRoutes.router);
app.use(the404Routers);

const port = 3000;

mongoConnect(() => {
    console.log(`<-> Listening on port: ${port}`);
    app.listen(port);
});
