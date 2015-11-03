'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    instaId: DataTypes.INTEGER,
    username: DataTypes.STRING,
    fullname: DataTypes.STRING,
    profilePic: DataTypes.STRING,
    bio: DataTypes.TEXT,
    token: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.hasMany(models.image);
      }
    }
  });
  return user;
};