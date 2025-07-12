'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    admin_level: DataTypes.INTEGER,
    discord_id: DataTypes.STRING,
    verified: DataTypes.BOOLEAN,
    balance: DataTypes.INTEGER,
    discord_balance: DataTypes.INTEGER,
    cart: DataTypes.JSONB,
    inventory: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};