const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bruker = sequelize.define('Bruker', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  navn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passord: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Bruker;
