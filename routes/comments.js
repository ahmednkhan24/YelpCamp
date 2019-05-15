var express = require("express");
var router  = express.Router({mergeParams: true});

var CampgroundDatabase = require("../models/campground");
var CommentDatabase    = require("../models/comment");

var Middleware = require("../middleware");

// NEW ROUTE - route to show the form that will send the new comment to the campground
router.get("/new", Middleware.isLoggedIn, function(request, response){
    CampgroundDatabase.findById(request.params.id, function(err, foundCampground){
        if (err) {
            request.flash("error", "Something went wrong");
            response.redirect("back");
        }
        else {
            // send the 'new' page + the data for the found campground
            response.render("comments/new", {campground: foundCampground}); 
        }
    });
});

// CREATE ROUTE - post route to add a new comment to the campground
router.post("/", Middleware.isLoggedIn, function(request, response){
    // find the specific campground with the corresponding ID
    CampgroundDatabase.findById(request.params.id, function(err, foundCampground){
        if (err) {
            request.flash("error", "Something went wrong");
            response.redirect("back");
        }
        else {
            // create a new comment
            CommentDatabase.create(request.body.comment, function(err, comment){
                if (err) {
                    request.flash("error", "Something went wrong");
                    response.redirect("back");
                }
                else {
                    // add username and id to comment
                    comment.author.id = request.user._id;
                    comment.author.username = request.user.username;
                    comment.save();
                    
                    // connect the new comment to the campground
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    
                    request.flash("success", "Successfully added comment");
            
                    // redirect to the campground's show page + the data for the found campground
                    response.redirect("/campgrounds/" + foundCampground._id);
                }
            });
        }
    });
});

// EDIT ROUTE - shows the form to edit the specific comment
router.get("/:comment_id/edit", Middleware.checkCommentOwnership, function(request, response){
    // error check if the campground id in the url was changed before updating
    CampgroundDatabase.findById(request.params.id, function(err, foundCampground){
        if (err || !foundCampground) {
            request.flash("error", "Something went wrong");
            return response.redirect("back");
        }
        
        // find the comment that is trying to be edited
        CommentDatabase.findById(request.params.comment_id, function(err, foundComment){
            if (err || !foundComment) {
                request.flash("error", "Something went wrong");
                response.redirect("back");
            }
            else {
                response.render("comments/edit", {campground_id: request.params.id, comment: foundComment});
            }
        });
    });
});

// UPDATE ROUTE - put route to save the edit made to the comment
router.put("/:comment_id", Middleware.checkCommentOwnership, function(request, response){
   CommentDatabase.findByIdAndUpdate(request.params.comment_id, request.body.comment, function(err, updatedComment){
       if (err) {
           request.flash("error", "Something went wrong");
           response.redirect("back");
       }
       else {
           request.flash("success", "Successfully edited comment");
           response.redirect("/campgrounds/" + request.params.id);
       }
   });
});

// DESTROY ROUTE
router.delete("/:comment_id", Middleware.checkCommentOwnership, function(request, response){
   CommentDatabase.findByIdAndRemove(request.params.comment_id, function(err){
        if (err) {
            request.flash("error", "Something went wrong");
            response.redirect("back");
        }
        else {
            request.flash("success", "Comment deleted");
            response.redirect("/campgrounds/" + request.params.id);
        }
    });
});

module.exports = router;