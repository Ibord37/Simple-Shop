'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'discord_balance', {
      type: Sequelize.INTEGER,
      allowNull: false,  // or false if you want it required
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'discord_balance');
  }
};
