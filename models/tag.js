'use strict';
module.exports = function(sequelize, DataTypes) {
  var tag = sequelize.define('tag', {
    tag: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        models.tag.belongsToMany(models.image, {through: "imagesTags"});
      }
    }
  });
  return tag;
};