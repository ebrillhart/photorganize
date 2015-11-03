'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'users',
      'token',
      Sequelize.STRING
    );
  },

  down: function (queryInterface, Sequelize) {
   queryInterface.removeColumn('user', 'token');
  }
};
