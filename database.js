const { Sequelize } = require("sequelize");
require("dotenv").config();
const path = require("path");

// Define the path to your SQLite database file
const dbPath = path.join(__dirname, "database.db");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});

module.exports = sequelize;