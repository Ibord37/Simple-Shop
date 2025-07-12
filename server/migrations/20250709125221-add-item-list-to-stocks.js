'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stocks', 'items_list', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,  // or false if you want it required
      defaultValue: []
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('stocks', 'items_list');
  }
};
