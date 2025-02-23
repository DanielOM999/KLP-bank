// Imports DataTypes and the connection details from the sequelize library and the database configuration file.
// This to connect to the database and define datatypes.
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Defines the Bruker model with the specified attributes and data types.
// This to make a table to keep track of the users.
const Bruker = sequelize.define("Bruker", {
  id: {
    type: DataTypes.UUID, // Makes the ID a unique identifier for each bank account.
    defaultValue: DataTypes.UUIDV4, // Sets the default value to a random UUID.
    primaryKey: true, // Sets the ID as the primary key.
  },
  navn: {
    type: DataTypes.STRING, // Makes the username a character varying of 255 characters.
    allowNull: false, // Does not allow null values.
    unique: true, // Ensures that each user is unique.
  },
  passord: {
    type: DataTypes.STRING, // Makes the password a character varying of 255 characters.
    allowNull: false, // Does not allow null values.
  },
  salt: {
    type: DataTypes.STRING, // Makes the salt a character varying of 255 characters.
    allowNull: false, // Does not allow null values.
  },
});

// Exports the Bruker model for use in other parts of the application.
module.exports = Bruker;
