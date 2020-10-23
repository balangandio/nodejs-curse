const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

const { configureCORS } = require('./middleware/cors');
const { isAuth } = require('./middleware/auth');
const { putImage } = require('./middleware/image-upload');
const { parseUploadedFileName } = require('./util/path');
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

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
app.use(isAuth);

app.put('/post-image', putImage);

app.use('/graphql', (req, res, next) => {
    return req.method === 'OPTIONS' ? res.sendStatus(200) : next();
});

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
    customFormatErrorFn(err) {
        if (!err.originalError) {
            return err;
        }

        const { message, data, code } = err.originalError;

        return { message: message || 'An error occurred', status: code, data };
    } 
}));

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