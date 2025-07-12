'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    expires_at: DataTypes.DATE,
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'RefreshTokens',
    timestamps: true
  });

  RefreshToken.associate = function(models) {
    RefreshToken.belongsTo(models.users, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });
  };

  return RefreshToken;
};
