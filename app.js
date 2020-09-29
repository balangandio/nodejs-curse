const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const seqDb = require('./util/database');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const the404Routers = require('./routes/404');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    User.findAll({where: {id: 1}})
        .then(users => users[0])
        .then(user => {
            req.user = user;
            next();
        }).catch(console.log);
});


app.use(shopRoutes);
app.use('/admin', adminRoutes.router);
app.use(the404Routers);

const port = 3000;


Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });


seqDb.sync()
    .then(() => User.findAll({where: {id: 1}}))
    .then(users => {
        return users.length == 0
            ? User.create({name: 'Human', email: 'asd@asd.asd'})
                .then(user => user.createCart())
            : users[0];
    }).then(() => {
        console.log(`<-> Listening on port: ${port}`);
        app.listen(port);
    }).catch(err => console.log(err));
