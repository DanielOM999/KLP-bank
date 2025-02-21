const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bankkonto = sequelize.define('Bankkonto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  kontonummer: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  saldo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  kontotype: {
    type: DataTypes.ENUM('standard', 'sparekonto', 'bsu'),
    allowNull: false,
    defaultValue: 'standard',
  },
});

module.exports = Bankkonto;
