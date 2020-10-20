const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const { configureCORS } = require('./middleware/cors');
const { parseUploadedFileName } = require('./util/path');

const MONGODB_URI = 'mongodb://node-curse-app:node-curse-pass@192.168.168.1/node-complete-api';

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images'),
    filename: (req, file, cb) => cb(null, parseUploadedFileName(file.originalname))
});
const fileFilter = (req, file, cb) => {
    const acceptedOnes = ['image/png', 'image/jpg', 'image/jpeg']
    const isAccepted = acceptedOnes.indexOf(file.mimetype) !== -1;
    cb(null, isAccepted);
};


const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

app.use(configureCORS);

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    if (error.statusCode !== 401) {
        console.log(error);
    }
    res.status(error.statusCode || 500).json({
        message: error.message,
        data: error.data
    });
});


const port = 8080;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`<-> Listening on port: ${port}`);
        app.listen(port);
    }).catch(console.log);