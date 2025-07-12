'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  transaction.init({
    type: DataTypes.STRING,
    status: DataTypes.STRING,
    items: DataTypes.STRING,
    expiresAt: DataTypes.DATE,
    issuer: DataTypes.STRING,
    price: DataTypes.INTEGER,
    payment: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'transaction',
  });
  return transaction;
};