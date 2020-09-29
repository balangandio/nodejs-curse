const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'root', {
    dialect: 'mysql',
    host: 'mysql.dev'
});

module.exports = sequelize;
