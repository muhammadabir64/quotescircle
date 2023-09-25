const { DataTypes } = require("sequelize");
const sequelize = require("../database.js");

const Settings = sequelize.define("Settings", {
  logo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  favicon: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  header_bg: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  header_slogan: {
    type: DataTypes.STRING,
    allowNull: true
  },
  header_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  copyright: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ga_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seo_author: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seo_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  seo_keywords: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, { 
  timestamps: false,
  hooks: {
    afterSync: async () => {
      const count = await Settings.count();
      if (count === 0) {
        await Settings.create();
      }
    }
  }
});

module.exports = Settings;