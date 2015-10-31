var express = require("express");
var router = express.Router();
var request = require("request");
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: false})); 

// array to delete once database is working
var photos = ["/images/img1.JPG", "/images/img2.JPG", "/images/img3.JPG", "/images/img4.JPG",
 "/images/img5.JPG", "/images/img6.JPG", "/images/img7.JPG", "/images/img8.JPG"];

router.get("/:id/dashboard", function(req, res) {
	photoArray = photos;
	res.render("dashboard", {photos: photoArray});
});

router.get("/:id/profile", function(req, res) {
	res.render("profile");
});

router.get("/:id/photo/:idx", function(req, res) {
	res.render("detail");
});

module.exports = router;