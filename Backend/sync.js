const sequelize = require("./config/database");
const { index } = require("./models/index");

const syncDatabase = async () => {
  try {
    console.log("Syncing databases...");
    await sequelize.sync({ force: false });
    console.log("Database synced successfully!");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

module.exports = syncDatabase;