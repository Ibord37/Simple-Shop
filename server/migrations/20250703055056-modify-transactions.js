'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      issuer: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      items: {
        type: Sequelize.JSONB,
        defaultValue: ''
      },
      price: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      payment: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      expiresAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};