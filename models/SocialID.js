const { DataTypes } = require("sequelize");
const sequelize = require("../database.js");

const SocialID = sequelize.define("SocialID", {
  platform: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false });

module.exports = SocialID;