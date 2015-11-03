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

// array to delete once database is working
// var photos = ["/images/img1.JPG", "/images/img2.JPG", "/images/img3.JPG", "/images/img4.JPG",
//  "/images/img5.JPG", "/images/img6.JPG", "/images/img7.JPG", "/images/img8.JPG"];

router.get("/:id/dashboard", function(req, res) {
	var userId = req.params.id;
	db.user.findById(userId).then(function(user) {
		ig.use({ access_token: user.token });
		ig.user_self_liked(hdl = function(err, medias, pagination, remaining, limit) {
			var isDone = 0;
			medias.forEach(function(photo) {
				if(pagination.next) {
    				pagination.next(hdl); // Will get second page results 
  				}
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
            					userId: userId
            				}
            			}).then(function(images) {
            				var photoArray = images;
            				res.render("dashboard", {photos: photoArray});
            			});
            		}
          		});
			});
		});
	});	
});

router.get("/:id/profile", function(req, res) {
	res.render("profile");
});

router.get("/:id/photo/:idx", function(req, res) {
	var userId = req.params.id;
	var photoId = req.params.idx;
	db.user.findById(userId).then(function(user) {
		db.image.findById(photoId).then(function(image) {
			var photo = image;
			res.render("detail", {photo: photo});
		});
	});	
});

module.exports = router;