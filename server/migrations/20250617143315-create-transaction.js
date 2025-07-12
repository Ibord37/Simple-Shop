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
      // issuer: {
      //   type: Sequelize.STRING
      // },
      // code: {
      //   type: Sequelize.STRING
      // },
      // item_name: {
      //   type: Sequelize.STRING
      // },
      // quantity: {
      //   type: Sequelize.INTEGER
      // },
      // total: {
      //   type: Sequelize.INTEGER
      // },
      details: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      transaction_time: {
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