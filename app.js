const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { parseUploadedFileName } = require('./util/path');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const errorsRoutes = require('./routes/errors');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const shopCtrl = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');

const MONGODB_URI = `mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@${process.env.MONGO_DB_HOST}/${process.env.MONGO_DB_BASE}`;

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploaded-images'),
    filename: (req, file, cb) => cb(null, parseUploadedFileName(file.originalname))
});

const fileFilter = (req, file, cb) => {
    const acceptedOnes = ['image/png', 'image/jpg', 'image/jpeg']
    const isAccepted = acceptedOnes.indexOf(file.mimetype) !== -1;
    cb(null, isAccepted);
};

const acessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);

app.set('view engine', 'ejs');


app.use(morgan('combined', { stream: acessLogStream }));
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'uploaded-images')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store }));
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        }).catch(err => { throw new Error(err); });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

app.post('/create-order', isAuth, shopCtrl.postOrder);

app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(shopRoutes);
app.use('/admin', adminRoutes.router);
app.use(authRoutes.router);
app.use(errorsRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render('500', { 
        pageTitle: 'An Error Occurred',
        path: '/500',
        isAuthenticated: req.session ? req.session.isLoggedIn : false,
        error
    });
});

const port = Number(process.env.APP_PORT);

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`<-> Listening on port: ${port}`);
        app.listen(port);
    }).catch(console.log);
