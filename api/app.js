const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');


const app = express();

app.use(bodyParser.json());

app.use('/feed', feedRoutes);

const port = 8080;

console.log(`<-> Listening on port: ${port}`);
app.listen(port);