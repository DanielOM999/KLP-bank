const { Sequelize } = require("sequelize")
require("dotenv").config();

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_LOGIN,
    password: process.env.SERVER_PASSWORD,
    database: process.env.SERVER_DATABASE,
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 1000
    },
});

module.exports = sequelize;