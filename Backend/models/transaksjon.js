const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaksjon = sequelize.define('Transaksjon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdraw'),
    allowNull: false,
  },
  belop: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  dato: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  nySaldo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

module.exports = Transaksjon;
