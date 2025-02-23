// Imports DataTypes and the connection details from the sequelize library and the database configuration file.
// This to connect to the database and define datatypes.
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Defines the Bankkonto model with the specified attributes and data types.
// This to make a table to keep track of the bank accounts.
const Bankkonto = sequelize.define("Bankkonto", {
  id: {
    type: DataTypes.UUID, // Makes the ID a unique identifier for each bank account.
    defaultValue: DataTypes.UUIDV4, // Sets the default value to a random UUID.
    primaryKey: true, // Sets the ID as the primary key.
  },
  kontonummer: {
    type: DataTypes.STRING, // Makes the account number character varying of 255 characters.
    allowNull: false, // Does not allow null values.
    unique: true, // Ensures that each account number is unique.
  },
  saldo: {
    type: DataTypes.DECIMAL(10, 2), // Makes the balance a numeric value with 10 digits and 2 decimal places.
    allowNull: false, // Does not allow null values.
    defaultValue: 0.0, // Sets the default value to 0.00.
  },
  kontotype: {
    type: DataTypes.ENUM("standard", "sparekonto", "bsu"), // Makes the account type an ENUM with possible values of 'standard', 'sparekonto', and 'bsu'.
    allowNull: false, // Does not allow null values.
    defaultValue: "standard", // Sets the default value to 'standard'.
  },
});

// Exports the model for use in other parts of the application.
module.exports = Bankkonto;
