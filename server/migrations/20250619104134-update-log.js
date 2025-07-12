'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('logs', 'success', {
      type: Sequelize.BOOLEAN,
      allowNull: false,  // or false if you want it required
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('logs', 'success');
  }
};
