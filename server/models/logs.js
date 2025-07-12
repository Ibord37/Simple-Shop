'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  logs.init({
    issuer_id: DataTypes.INTEGER,
    issuer_name: DataTypes.STRING,
    details: DataTypes.STRING,
    time: DataTypes.DATE,
    success: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'logs',
  });
  return logs;
};