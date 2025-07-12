'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class stock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  stock.init({
    item_name: DataTypes.STRING,
    item_quantity: DataTypes.INTEGER,
    items_per_price: DataTypes.INTEGER,
    sell_price: DataTypes.INTEGER,
    item_code: DataTypes.STRING,
    item_display: DataTypes.STRING,
    items_list: DataTypes.ARRAY(DataTypes.STRING)
  }, {
    sequelize,
    modelName: 'stock',
  });
  return stock;
};