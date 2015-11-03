'use strict';
module.exports = function(sequelize, DataTypes) {
  var note = sequelize.define('note', {
    noteText: DataTypes.TEXT,
    imageId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        models.note.belongsTo(models.image);
      }
    }
  });
  return note;
};