require("dotenv").config();

// import express and necessary Node packages
var express            = require("express"),
    app                = express(),
    bodyParser         = require("body-parser"),
    mongoose           = require("mongoose"),
    flash              = require("connect-flash"),
    passport           = require("passport"),
    LocalStrategy      = require("passport-local"),
    expressSession     = require("express-session"),
    methodOverride     = require("method-override");

// import custom models for the app
var User               = require("./models/user");
//seedDB             = require("./seeds");
    
// import routes for the app
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

// app configuration

// allows us to server our custom CSS and JS in the public directory
app.use(express.static(__dirname + "/public"));

// body-parser allows us to use form data
app.use(bodyParser.urlencoded({extended: true}));

// allows us to use the flash package that creates temporary flash messages
app.use(flash());

// allows us to use middleware to save sessions going from one route to another
// secret is used to encode and decode the session
app.use(expressSession({
    secret: "This is a super secret message!",
    resave: false,
    saveUninitialized: false
}));

// we need these two lines whenever we're going to use passport
app.use(passport.initialize());
app.use(passport.session());

// allows us to implement user authentication in our app
passport.use(new LocalStrategy(User.authenticate()));

// responsible for reading the session, 
// taking the data from the session thats encoded, decoding it,
// and then encoding it and putting it back into the session. 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// development database url: mongodb://localhost:27017/yelp_camp
// production database url: mongodb://<USER_NAME>:<PASSWORD>@ds215822.mlab.com:15822/ahmedsyelpcamp

var URL = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp";
mongoose.connect(URL, {useNewUrlParser: true});

// allows us to not have to write .ejs extension for every ejs file
app.set("view engine", "ejs");

// allows us to override methods in order to use PUT requests in our forms
app.use(methodOverride("_method"));

// custom functions that deletes campgrounds and comments database and adds new ones on server startup
//seedDB();

// define our own middleware that will pass the current user and any flash message to each page
app.use(function(request, response, next){
    response.locals.currentUser = request.user;
    response.locals.error = request.flash("error");
    response.locals.success = request.flash("success");
    next();
});

// allows us to incorporate our routes from the other files in our app
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.get("*", function(request,response){
   response.render("404");
});

// allows the server to start listening for connections
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Server has started");
});