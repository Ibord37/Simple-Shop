'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stocks', 'item_display', {
      type: Sequelize.STRING,
      allowNull: false,  // or false if you want it required
      defaultValue: ""
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('stocks', 'item_display');
  }
};
