const { DataTypes } = require("sequelize");
const moment = require("moment");
const sequelize = require("../database.js");

const Quote = sequelize.define("Quote", {
  quote_file: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quote_text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  external_links: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  total_votes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  total_downloads: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  publish_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    get() {
      return moment(this.getDataValue("publish_date")).format("D MMM, YYYY");
    }
  }
}, { timestamps: false});

const Author = sequelize.define('author', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false});

const Topic = sequelize.define('topic', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false});

Quote.belongsTo(Author);
Quote.belongsToMany(Topic, { through: 'quote_topic' });
Topic.belongsToMany(Quote, { through: 'quote_topic' });

module.exports = {
  Quote,
  Author,
  Topic,
};