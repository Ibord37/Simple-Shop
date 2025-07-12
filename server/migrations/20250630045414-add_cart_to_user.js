'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'cart', {
      type: Sequelize.JSONB,
      allowNull: false,  // or false if you want it required
      defaultValue: []
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'cart');
  }
};
