// Imports 'Sequelize' and 'dotenv' to interact with the PostgreSQL database and use the environment variables.
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Defines details to connect to the PostgreSQL database.
const sequelize = new Sequelize({
  dialect: "postgres", // That we are using PostgreSQL
  host: process.env.SERVER_HOST, // The host of the PostgreSQL server (i did put it as 'localhost')
  port: process.env.SERVER_PORT, // The port of the PostgreSQL server (i did put it as '5432' the deafult port for PostgreSQL)
  username: process.env.SERVER_LOGIN, // The login of the PostgreSQL server (i did put it as 'postgres' the deafult user for PostgreSQL) - may be smart to make a dedicated node user
  password: process.env.SERVER_PASSWORD, // The password of the PostgreSQL server
  database: process.env.SERVER_DATABASE, // The name of the PostgreSQL database

  // Here i configured the connection pool to hold max 5 connections and keep them open for 3 seconds before closing them.
  pool: {
    max: 5,
    min: 0,
    acquire: 3000,
    idle: 1000,
  },
});

// Exports the Sequelize instance to be used in other parts of the application.
module.exports = sequelize;
