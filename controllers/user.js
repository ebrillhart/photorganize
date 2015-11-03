var express = require("express");
var router = express.Router();
var request = require("request");
var db = require('./../models');
var session = require('express-session');
var flash = require('connect-flash');
var ig = require('instagram-node').instagram();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: false}));
router.use(flash());
router.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true
})); 

router.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.alerts = req.flash();
  next();
});

// see current user dashboard of photos
router.get("/:id/dashboard", function(req, res) {
	var userId = req.params.id;
	db.user.findById(userId).then(function(user) {
		ig.use({ access_token: user.token });
		ig.user_self_liked(hdl = function(err, medias, pagination, remaining, limit) {
			var isDone = 0;
			if(pagination.next) {
    			pagination.next(hdl); // Will get second page results 
  			}
			medias.forEach(function(photo) {
				var imgID = photo.id;
          		db.image.findOrCreate({
            		where: {imgId: imgID},
            		defaults: {
   						lat: photo.location ? photo.location.latitude : null,
   						long: photo.location ? photo.location.longitude : null,
   						locationName: photo.location ? photo.location.name : null,
   						caption: photo.caption ? photo.caption.text : null,
                    	link: photo.link,
                    	userId: userId,
                    	likeCount: photo.likes ? photo.likes.count : null,
                    	thumbnail: photo.images.thumbnail.url,
                    	standardRes: photo.images.standard_resolution.url,
                    	posterName: photo.user.username,
                    	hidden: null
            		}
          		}).spread(function(image, created, err) {
            		isDone++;
            		if (isDone >= medias.length) {
            			db.image.findAll({
            				where: {
            					userId: userId,
                      hidden: null
            				},
            			}).then(function(images) {
            				var photoArray = images;
            				var thisUser = user;
            				res.render("dashboard", {photos: photoArray, user: thisUser});
            			});
            		}
          		});
			});
		});
	});	
});

// see current user profile
router.get("/:id/profile", function(req, res) {
	userID = req.params.id;
	db.user.findById(userID).then(function(user) {
		var thisUser = user;
		res.render("profile", {user: thisUser});
	});
});

// see detail of unarchived photo
router.get("/:id/photo/:idx", function(req, res) {
	var userId = req.params.id;
	var photoId = req.params.idx;
	db.user.findById(userId).then(function(user) {
		db.image.findById(photoId).then(function(image) {
			var photo = image;
      var thisUser = user;
			res.render("detail", {photo: photo, user: thisUser});
		});
	});	
});

// get archived photos
router.get("/:id/archive", function(req, res) {
  userID = req.params.id;
  db.user.findById(userID).then(function(user) {
    db.image.findAll({
      where: {
        hidden: "yes"
      }
    }).then(function(images) {
      var photos = images;
      var thisUser = user;
      res.render("archive", {photos: photos, user: thisUser});
    });
  });
});

// detail of archived photo
router.get("/:id/archive/:idx", function(req, res) {
  userID = req.params.id;
  photoID = req.params.idx;
  db.user.findById(userID).then(function(user) {
    db.image.findById(photoID).then(function(image) {
      var photo = image;
      var thisUser = user;
      res.render("archivedetail", {photo: photo, user: thisUser});
    });
  }); 
});

// archive selected photo
router.get("/:id/photo/:idx/hide", function(req, res) {
  userID = req.params.id;
  photoID = req.params.idx;
  db.image.find({
    where: {
      id: photoID
    }
  }).then(function(image){
    image.hidden = "yes";
    image.save().then(function() {
      res.redirect('/user/' + userID + '/dashboard');
    });
  });  
});

// unarchive selected photo
router.get("/:id/archive/:idx/show", function(req, res) {
  userID = req.params.id;
  photoID = req.params.idx;
  db.image.find({
    where: {
      id: photoID
    }
  }).then(function(image){
    image.hidden = null;
    image.save().then(function() {
      res.redirect('/user/' + userID + '/dashboard');
    });
  });  
});

// use router in index.js
module.exports = router;