const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'mysql.dev',
    user: 'root',
    password: 'root',
    database: 'node-complete'
});

module.exports = pool.promise();
