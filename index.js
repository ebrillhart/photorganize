var express = require('express');
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var flash = require('connect-flash');
var db = require('./models');
var passport = require('passport');
var ig = require('instagram-node').instagram();
var strategies = require('./config/strategies');
var app = express();
// setting ejs
app.set('view engine', 'ejs');
// app.use calls (ejs Layouts, static files, body-parser, flash, 
// express-session, passport, passport session)
app.use(ejsLayouts);
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(flash());
app.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// console.log(process.env.INSTAGRAM_CLIENT_ID);
// console.log(process.env.INSTAGRAM_CLIENT_SECRET);
passport.serializeUser(strategies.serializeUser);
passport.deserializeUser(strategies.deserializeUser);
passport.use(strategies.instagramStrategy);
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.alerts = req.flash();
    next();
});
// **************
// homepage route
// **************
app.get("/", function(req, res) {
    res.render("index");
});
// *******************************************
// connects the user to Instagram sign-in page
// *******************************************
app.get('/auth/instagram', passport.authenticate('instagram'));
// ***************************************************
// authenticates and redirects user to their dashboard
// ***************************************************
app.get('/auth/instagram/callback', passport.authenticate('instagram', {
    failureRedirect: '/error'
}), function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/user/' + req.user.id + '/dashboard');
});
// ***********************************
// error message if issues with log-in
// ***********************************
app.get('/loginerror', function(req, res) {
    res.render("loginerror");
});
// ****************************************************
// error message if user doesn't have access permission
// ****************************************************
app.get('/permissionerror', function(req, res) {
    res.render("permissionerror");
});
// ************************************
// logs out the user from their session
// ************************************
app.get('/logout', function(req, res) {
    req.logout();
    req.flash('info', 'You have been logged out.');
    res.redirect('/');
});
// ************************
// accesses user controller
// ************************
app.use("/user/", require("./controllers/user"));
// *************
// port listener
// *************
app.listen(process.env.PORT || 3000);