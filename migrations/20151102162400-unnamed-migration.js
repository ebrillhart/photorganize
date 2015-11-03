'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    
    queryInterface.removeColumn('images', 'imgId');

    queryInterface.addColumn(
      'images',
      'imgId',
      Sequelize.STRING
    );


  },

  down: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'images',
      'imgId',
      Sequelize.INTEGER
    );

    queryInterface.removeColumn('images', 'imgId');
  }
};
