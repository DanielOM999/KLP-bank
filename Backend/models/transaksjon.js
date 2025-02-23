// Imports DataTypes and the connection details from the sequelize library and the database configuration file.
// This to connect to the database and define datatypes.
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Defines the Transaksjon model with the specified attributes and data types.
// This to make a table to keep track of the transactions made by accounts.
const Transaksjon = sequelize.define("Transaksjon", {
  id: {
    type: DataTypes.UUID, // Makes the ID a unique identifier for each bank account.
    defaultValue: DataTypes.UUIDV4, // Sets the default value to a random UUID.
    primaryKey: true, // Sets the ID as the primary key.
  },
  type: {
    type: DataTypes.ENUM("deposit", "withdraw"), // Makes the transaction type an ENUM with possible values of 'deposit' and 'withdraw'.
    allowNull: false, // Does not allow null values.
  },
  belop: {
    type: DataTypes.DECIMAL(10, 2), // Makes the transaction amount a DECIMAL with up to 10 digits and 2 decimal places.
    allowNull: false, // Does not allow null values.
  },
  dato: {
    type: DataTypes.DATE, // Makes the transaction date a DATE.
    allowNull: false, // Does not allow null values.
    defaultValue: DataTypes.NOW, // Sets the default value to the current date and time.
  },
  nySaldo: {
    type: DataTypes.DECIMAL(10, 2), // Makes the new balance a DECIMAL with up to 10 digits and 2 decimal places.
    allowNull: false, // Does not allow null values.
  },
});

// Exports the model for use in other parts of the application.
module.exports = Transaksjon;
