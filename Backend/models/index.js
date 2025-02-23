// Imports all the diffrent models
const Bruker = require("./bruker");
const Bankkonto = require("./bankkonto");
const Transaksjon = require("./transaksjon");

// Sets the 'bruker' model to have a one-to-many relationship with the 'Bankkonto' model
Bruker.hasMany(Bankkonto, { foreignKey: "brukerId", onDelete: "CASCADE" });
Bankkonto.belongsTo(Bruker, { foreignKey: "brukerId" });

// Sets the 'bankkonto' model to have a one-to-many relationship with the 'Transaksjon' model
Bankkonto.hasMany(Transaksjon, {
  foreignKey: "bankkontoId",
  onDelete: "CASCADE",
});
Transaksjon.belongsTo(Bankkonto, { foreignKey: "bankkontoId" });

// Exports all the models to be used in other parts of the application
module.exports = {
  Bruker,
  Bankkonto,
  Transaksjon,
};
