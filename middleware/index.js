// all middleware functions go here
var CampgroundDatabase = require("../models/campground");
var CommentDatabase    = require("../models/comment");

var middlewareObj = {};

// check if a user is logged in
middlewareObj.isLoggedIn = function(request, response, next) {
    if (request.isAuthenticated()) {
        return next();
    }
    else {
        request.flash("error", "You need to be logged in to do that");
        response.redirect("/login");
    }
};

// check if a user is logged in and if the comment they are trying to edit belongs to them
middlewareObj.checkCommentOwnership = function(request, response, next) {
     // check if user is logged in
    if (request.isAuthenticated()) {
        CommentDatabase.findById(request.params.comment_id, function(err, foundComment){
            if (err || !foundComment) {
                request.flash("error", "Comment not found");
                response.redirect("back");
            }
            // check if this comment belongs to the user who is logged on
            else if (foundComment.author.id.equals(request.user._id)) {
               next();
            }
            else {
                request.flash("error", "You don't have permission to do that");
                response.redirect("back");
            }
        });
    }
    else {
        request.flash("error", "You need to be logged in to do that");
        response.redirect("back");
    }
};

// check if a user is logged in and if the campground they are trying to edit belongs to them
middlewareObj.checkCampgroundOwnership = function(request, response, next) {
    // check if user is logged in
    if (request.isAuthenticated()) {
        CampgroundDatabase.findById(request.params.id, function(err, foundCampground){
            if (err || !foundCampground) {
                request.flash("error", "Campground not found");
                response.redirect("back");
            }
            // check if this campground belongs to the user who is logged on
            else if (foundCampground.author.id.equals(request.user._id)) {
               next();
            }
            else {
                request.flash("error", "You don't have permission to do that");
                response.redirect("back");
            }
        });
    }
    else {
        request.flash("error", "You need to be logged in to do that");
        response.redirect("back");
    }
};

module.exports = middlewareObj;