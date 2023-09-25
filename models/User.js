const { DataTypes } = require("sequelize");
const sequelize = require("../database.js");

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  permission_quotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  permission_authors: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  permission_topics: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  permission_pages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  permission_users: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  permission_settings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
}, { 
  timestamps: false,
  hooks: {
    afterSync: async () => {
      const count = await User.count();
      if (count === 0) {
        await User.create({
          email: "admin@mail.com",
          password: "$2a$10$it9Ih/jCjFfgheW4vuSTieFyW6HrKuvNRsfSSD3CyImbUkmNIvcUS",
          permission_quotes: 1,
          permission_authors: 1,
          permission_topics: 1,
          permission_pages: 1,
          permission_users: 1,
          permission_settings: 1,
        });
      }
    }
  }
});

module.exports = User;