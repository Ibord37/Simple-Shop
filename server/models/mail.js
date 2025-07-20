'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mail.belongsToMany(models.users, {
        through: models.user_mail,
        foreignKey: 'mail_id',
        otherKey: 'user_id'
      });
    }
  }
  Mail.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    is_broadcast: DataTypes.BOOLEAN,
    sender: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mail',
  });
  return Mail;
};