const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const the404Routes = require('./routes/404');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const MONGODB_URI = 'mongodb://node-curse-app:node-curse-pass@192.168.168.1/node-complete';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store }));


app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        }).catch(console.log);
});


app.use(shopRoutes);
app.use('/admin', adminRoutes.router);
app.use(authRoutes.router);
app.use(the404Routes);

const port = 3000;

mongoose.connect(MONGODB_URI)
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
