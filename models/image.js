'use strict';
module.exports = function(sequelize, DataTypes) {
  var image = sequelize.define('image', {
    lat: DataTypes.STRING,
    long: DataTypes.STRING,
    locationName: DataTypes.STRING,
    caption: DataTypes.TEXT,
    link: DataTypes.STRING,
    likeCount: DataTypes.INTEGER,
    thumbnail: DataTypes.STRING,
    standardRes: DataTypes.STRING,
    imgId: DataTypes.STRING,
    posterName: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    hidden: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.image.belongsTo(models.user);
      }
    }
  });
  return image;
};