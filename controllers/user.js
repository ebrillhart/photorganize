// *********************************
// adding dependencies and libraries
// *********************************
var express = require("express");
var router = express.Router();
var request = require("request");
var db = require('./../models');
var session = require('express-session');
var flash = require('connect-flash');
var ig = require('instagram-node').instagram();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(flash());
// set express session
router.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true
}));
// set locals
router.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.alerts = req.flash();
    next();
});
// *****************
// ROUTES FROM /USER
// *****************
// ************************************
// see current user dashboard of photos
// ************************************
router.get("/:id/dashboard", function(req, res) {
    if (req.user.id == req.params.id) { // if the user is logged in
        var userId = req.params.id;
        // find the user in DB
        db.user.findById(userId).then(function(user) {
            ig.use({
                access_token: user.token
            });
            // use API to find pictures that user has liked
            ig.user_self_liked(hdl = function(err, medias, pagination, remaining, limit) {
                var isDone = 0;
                if (pagination.next) {
                    pagination.next(hdl); // Will get second page results 
                }
                // add new photos to the database & find photos associated with user already
                // saved
                medias.forEach(function(photo) {
                    var imgID = photo.id;
                    db.image.findOrCreate({
                        where: {
                            imgId: imgID
                        },
                        // set defaults for DB storage
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
                                    // only display photos with hidden: null
                                    hidden: null
                                },
                                order: [
                                    ['id', 'ASC'],
                                ]
                            }).then(function(images) {
                                db.tag.findAll().then(function(tags) {
                                    var allTags = tags;
                                    var photoArray = images;
                                    var thisUser = user;
                                    // render the dashboard for given user
                                    res.render("dashboard", {
                                        photos: photoArray,
                                        user: thisUser,
                                        tags: allTags
                                    });
                                });
                            })
                        }
                    });
                });
            });
        });
    } else {
        res.redirect('/permissionerror'); // error message if not current user
    }
});
// ************************
// see current user profile
// ************************
router.get("/:id/profile", function(req, res) {
    if (req.user.id == req.params.id) {
        userID = req.params.id;
        db.user.findById(userID).then(function(user) {
            var thisUser = user;
            res.render("profile", {
                user: thisUser
            });
        });
    } else {
        res.redirect('/permissionerror');
    }
});
// ******************************
// see detail of dashboard photo
// ******************************
router.get("/:id/photo/:idx", function(req, res) {
    if (req.user.id == req.params.id) {
        var userId = req.params.id;
        var photoId = req.params.idx;
        db.user.findById(userId).then(function(user) {
            db.image.findById(photoId).then(function(image) {
                image.getTags().then(function(tags) {
                    image.getNotes().then(function(notes) {
                        var photo = image;
                        var thisUser = user;
                        var allTags = tags;
                        var allNotes = notes;
                        res.render("detail", {
                            photo: photo,
                            user: thisUser,
                            notes: allNotes,
                            tags: allTags
                        });
                    });
                });
            });
        });
    } else {
        res.redirect('/permissionerror');
    }
});
// ********************
// add new tag to photo
// ********************
router.post("/:id/photo/:idx/tag", function(req, res) {
    var userID = req.params.id;
    var photoID = req.params.idx;
    var newTag = req.body.tag;
    db.image.findById(photoID).then(function(image) {
        db.tag.findOrCreate({
            where: {
                tag: newTag
            }
        }).spread(function(tag, created) {
            image.addTag(tag).then(function() {
                res.redirect("/user/" + userID + "/photo/" + photoID)
            });
        });
    });
});
// *********************
// delete tag from photo
// *********************
router.get("/:id/photo/:idx/tag/:tagid", function(req, res) {
    if (req.user.id == req.params.id) {
        var userID = req.params.id;
        var photoID = req.params.idx;
        var tagID = req.params.tagid;
        db.imagesTags.destroy({
            where: {
                imageId: photoID,
                tagId: tagID
            }
        }).then(function() {
            res.redirect("/user/" + userID + "/photo/" + photoID);
        }).catch(function(e) {
            res.send({
                'msg': 'error',
                'error': e
            });
        });
    } else {
        res.redirect('/permissionerror');
    }
});
// ******************************
// dashboard search functionality
// ******************************
router.post("/:id/dashboard/search", function(req, res) {
    var tagName = req.body.tag;
    var userID = req.params.id;
    console.log(tagName);
    db.tag.find({
        where: {
            tag: tagName
        }
    }).then(function(tag) {
        if (tag.tag == tagName) {
        tag.getImages({
            where: {
                hidden: null,
                userId: userID
            }
        }).then(function(images) {
            db.user.find({
                where: {
                    id: userID
                }
            }).then(function(user) {
                var photoArray = images;
                var thisUser = user;
                res.render("dashboard", {
                    photos: photoArray,
                    user: thisUser
                });        
            });
        });
       } else {
        res.redirect("/user/" + userID + "/dashboard");
       }
    });
});
// *******************************
// add new note to dashboard photo
// *******************************
router.post("/:id/photo/:idx/note", function(req, res) {
    var userID = req.params.id;
    var photoID = req.params.idx;
    var newNote = req.body.note;
    console.log(newNote);
    db.image.find({
        where: {
            id: photoID
        }
    }).then(function(image) {
        image.createNote({
            noteText: newNote,
            imageId: photoID
        }).then(function(note) {
            res.redirect("/user/" + userID + "/photo/" + photoID);
        });
    });
});
// **********************
// delete note from photo
// **********************
router.get("/:id/photo/:idx/note/:noteId", function(req, res) {
    if (req.user.id == req.params.id) {
        var userID = req.params.id;
        var photoID = req.params.idx;
        var noteID = req.params.noteId;
        db.note.destroy({
            where: {
                id: noteID
            }
        }).then(function() {
            res.redirect("/user/" + userID + "/photo/" + photoID);
        }).catch(function(e) {
            res.send({
                'msg': 'error',
                'error': e
            });
        });
    } else {
        res.redirect('/permissionerror');
    }
});
// *******************
// get archived photos
// *******************
router.get("/:id/archive", function(req, res) {
    if (req.user.id == req.params.id) {
        userID = req.params.id;
        db.user.findById(userID).then(function(user) {
            db.image.findAll({
                where: {
                    hidden: "yes",
                    userId: userID
                }
            }).then(function(images) {
                var photos = images;
                var thisUser = user;
                res.render("archive", {
                    photos: photos,
                    user: thisUser
                });
            });
        });
    } else {
        res.redirect('/permissionerror');
    }
});
// ************************
// detail of archived photo
// ************************
router.get("/:id/archive/:idx", function(req, res) {
    if (req.user.id == req.params.id) {
        var userId = req.params.id;
        var photoId = req.params.idx;
        db.user.findById(userId).then(function(user) {
            db.image.findById(photoId).then(function(image) {
                image.getTags().then(function(tags) {
                    image.getNotes().then(function(notes) {
                        var photo = image;
                        var thisUser = user;
                        var allTags = tags;
                        var thisNote = notes;
                        res.render("archivedetail", {
                            photo: photo,
                            user: thisUser,
                            note: thisNote,
                            tags: allTags
                        });
                    });
                });
            });
        });
    } else {
        res.redirect('/permissionerror');
    }
});
// **********************
// archive selected photo
// **********************
router.get("/:id/photo/:idx/hide", function(req, res) {
    if (req.user.id == req.params.id) {
        userID = req.params.id;
        photoID = req.params.idx;
        db.image.find({
            where: {
                id: photoID
            }
        }).then(function(image) {
            image.hidden = "yes";
            image.save().then(function() {
                res.redirect('/user/' + userID + '/dashboard');
            });
        });
    } else {
        res.redirect('/permissionerror');
    }
});
// ************************
// unarchive selected photo
// ************************
router.get("/:id/archive/:idx/show", function(req, res) {
    if (req.user.id == req.params.id) {
        userID = req.params.id;
        photoID = req.params.idx;
        db.image.find({
            where: {
                id: photoID
            }
        }).then(function(image) {
            image.hidden = null;
            image.save().then(function() {
                res.redirect('/user/' + userID + '/dashboard');
            });
        });
    } else {
        res.redirect('/permissionerror');
    }
});
// **********************
// use router in index.js
// **********************
module.exports = router;