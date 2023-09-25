const { DataTypes } = require("sequelize");
const sequelize = require("../database.js");

const Page = sequelize.define("Page", {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, { timestamps: false });

module.exports = Page;