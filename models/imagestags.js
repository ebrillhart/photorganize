'use strict';
module.exports = function(sequelize, DataTypes) {
  var imagesTags = sequelize.define('imagesTags', {
    imageId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return imagesTags;
};