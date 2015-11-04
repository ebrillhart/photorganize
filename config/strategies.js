var InstagramStrategy = require('passport-instagram').Strategy;
var db = require('../models');
module.exports = {
    instagramStrategy: new InstagramStrategy({
        clientID: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/instagram/callback'
    }, function(accessToken, refreshToken, profile, done) {
        var username = profile.username;
        db.user.findOrCreate({
            where: {
                username: username
            },
            defaults: {
                fullname: profile.displayName,
                instaId: profile.id,
                profilePic: profile._json.data.profile_picture,
                bio: profile._json.data.bio
            }
        }).spread(function(user, created, err) {
            if (user || created) {
                user.token = accessToken;
                user.save().then(function() {
                    done(null, user.get());
                });
            } else {
                return done(err, user);
            }
        }).catch(function(err, user) {
            return done(err, user);
        });
    }),
    serializeUser: function(user, done) {
        done(null, user.id);
    },
    deserializeUser: function(id, done) {
        db.user.findById(id).then(function(user) {
            done(null, user.get());
        }).catch(done);
    }
}