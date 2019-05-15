var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User     = require("../models/user");

// ROOT DIRECTORY route to the landing page
router.get("/", function(request, response){
    response.render("landing");
});

// show the register form
router.get("/register", function(request, response){
    response.render("register", {page: "register"});
});

// AUTHENTICATE ROUTES
// handle sign up logic
router.post("/register", function(request, response){
    var newUser = new User({username: request.body.username});
    User.register(newUser, request.body.password, function(err, newlyCreatedUser){
        if (err) {
            request.flash("error", err.message);
            response.redirect("/register");
        }
        else {
            passport.authenticate("local")(request, response, function(){
                request.flash("success", "Welcome to YelpCamp " + newlyCreatedUser.username);
                response.redirect("/campgrounds");
            });
        }
    });
});

// show the login form
router.get("/login", function(request, response){
    response.render("login", {page: "login"});
});

// handle sign in logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        successFlash: "Welcome back to YelpCamp!",
        failureFlash: true
    }), function(request, response){
});

// log out route
router.get("/logout", function(request, response){
    request.logout();
    request.flash("success", "Logged you out!");
    response.redirect("/campgrounds");
});

module.exports = router;