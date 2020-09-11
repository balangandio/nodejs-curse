const http = require('http');

const { handler } = require('./routes');

const server = http.createServer(handler);

server.listen(3000);
