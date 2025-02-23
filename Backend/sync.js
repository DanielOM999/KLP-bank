// Imports the sequelize config from 'config/database', this contains the connection details for the database.
const sequelize = require("./config/database");

// Makes the 'syncDatabase' function to sync the database with Sequelize. The force option is set to false,
// which means that the existing tables in the database will not be dropped before they are recreated.
const syncDatabase = async () => {
  try {
    console.log("Syncing databases...");
    await sequelize.sync({ force: false });
    console.log("Database synced successfully!");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

// Exports the 'syncDatabase' function so that it can be used in 'server.js'.
module.exports = syncDatabase;
