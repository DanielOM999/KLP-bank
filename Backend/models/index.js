const Bruker = require('./bruker');
const Bankkonto = require('./bankkonto');
const Transaksjon = require('./transaksjon');

Bruker.hasMany(Bankkonto, { foreignKey: 'brukerId', onDelete: 'CASCADE' });
Bankkonto.belongsTo(Bruker, { foreignKey: 'brukerId' });

Bankkonto.hasMany(Transaksjon, { foreignKey: 'bankkontoId', onDelete: 'CASCADE' });
Transaksjon.belongsTo(Bankkonto, { foreignKey: 'bankkontoId' });

module.exports = {
  Bruker,
  Bankkonto,
  Transaksjon,
};
