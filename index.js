var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(express.static(__dirname + '/static'));

var ejsLayouts = require("express-ejs-layouts");
app.use(ejsLayouts);
app.use(bodyParser.urlencoded({extended: false})); 

app.set("view engine", "ejs");

app.get("/", function(req, res) {
	res.render("index");
});

app.use("/user/", require("./controllers/user"));

app.listen(3000);