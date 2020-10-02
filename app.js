const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const the404Routers = require('./routes/404');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    User.findOne()
        .then(user => {
            req.user = user;
            next();
        }).catch(console.log);
});


app.use(shopRoutes);
app.use('/admin', adminRoutes.router);
app.use(the404Routers);

const port = 3000;

mongoose.connect('mongodb://node-curse-app:node-curse-pass@192.168.168.1/node-complete?retryWrites=true')
    .then(() => {
        return User.findOne().then(user => {
            if (!user) {
                user = new User({
                    name: 'Human',
                    email: 'asd@asd.asd',
                    cart: { items: [] }
                });

                return user.save();
            }

            return user;
        });
    }).then(() => {
        console.log(`<-> Listening on port: ${port}`);
        app.listen(port);
    }).catch(console.log);
