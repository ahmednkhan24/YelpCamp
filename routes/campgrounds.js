/*
    RESTFUL ROUTES
    
    name    url                     verb     desc
    ============================================================================
    INDEX   /campgrounds            GET     display a list of all campgrounds
    
    NEW     /campgrounds/new        GET     displays the form to make a new campground
    CREATE  /campgrounds            POST    adds a new campground to the database
    
    SHOW    /campgrounds/:id        GET     shows info about one campground
    
    EDIT    /campgrounds/:id/edit   GET     shows the edit form for one campground
    UPDATE  /campgrounds/:id        PUT     updates a particular campground, then redirects somewhere
    
    DESTROY /campgrounds/:id        DELETE  deletes a particular campground, then redirects somehwere
*/

var express = require("express");
var router  = express.Router();

var CampgroundDatabase = require("../models/campground");
var Middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");
 
var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
 
var Geocoder = NodeGeocoder(options);

// INDEX ROUTE - route to the campgrounds
router.get("/", function(request, response){
    // get all the campgrounds from the database
    CampgroundDatabase.find({}, function(err, allCampgrounds){
        if (err) {
            request.flash("error", "Something went wrong");
            response.redirect("back");
        }
        else {
             // send the campgrounds page + the campground data array
             response.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
        }
    });
});

// NEW ROUTE - route to show the form that will send the new campground data to the post route
router.get("/new", Middleware.isLoggedIn, function(request, response){
    response.render("campgrounds/new");
});

// CREATE ROUTE - post route to add a new campground
router.post("/", Middleware.isLoggedIn, function(request, response){
    // take the address from the input form and turn it into a geocode
    Geocoder.geocode(request.body.location, function (err, data) {
        if (err || !data.length) {
            request.flash("error", "Invalid address: " + err.message);
            return response.redirect("back");
        }
        
        // get data from form
        var name = request.body.newCGname;
        var price = request.body.newCGprice;
        var image = request.body.newCGimage;
        var desc = request.body.newCGdesc;
        var author = {
            id: request.user._id,
            username: request.user.username
        };
        var lat = data[0].latitude;
        var lng = data[0].longitude;   
        var location = data[0].formattedAddress; 
        
        // create a new campground object
        var newCampground = {
            name: name, 
            price: price, 
            image: image, 
            desc: desc, 
            author: author, 
            location: location, 
            lat: lat, 
            lng: lng
        };
        
        // add the new campground to the database
        CampgroundDatabase.create(newCampground, function(err, newlyCreated){
            if (err) {
                request.flash("error", "Something went wrong");
                response.redirect("back");
            }
            else {
                // redirect to campgrounds page
                response.redirect("/campgrounds");
            }
        });
    });
});

// SHOW ROUTE - shows more info about one campground
router.get("/:id", function(request, response){
    // find the specific campground by it's ID
    CampgroundDatabase.findById(request.params.id).populate("comments").exec(function(err, foundCampground){
        if (err || !foundCampground) {
            request.flash("error", "Campground not found");
            response.redirect("back");
        }
        else {
            // send the 'show' page + the data for the found campground
            response.render("campgrounds/show", {campground: foundCampground}); 
        }
    });
});

// EDIT ROUTE - shows the form for the campground to be edited, if the user can
router.get("/:id/edit", Middleware.checkCampgroundOwnership, function(request, response){
    CampgroundDatabase.findById(request.params.id, function(err, foundCampground){
        if (err) {
            request.flash("error", "Something went wrong");
            response.redirect("/campgrounds");
        }
        else {
            response.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UPDATE ROUTE - updates the campground information in the database, if the user can
router.put("/:id", Middleware.checkCampgroundOwnership, function(request, response){
    // take the address from the input form and turn it into a geocode
    Geocoder.geocode(request.body.location, function (err, data){
        if (err || !data.length) {
            request.flash("error", "Invalid address");
            return response.redirect("back");
        }
            
        request.body.edit.lat = data[0].latitude;
        request.body.edit.lng = data[0].longitude;
        request.body.edit.location = data[0].formattedAddress;
        
        CampgroundDatabase.findByIdAndUpdate(request.params.id, request.body.edit, function(err, updated){
            if (err) {
                request.flash("error", "Something went wrong");
                response.redirect("/campgrounds");
            }
            else {
                request.flash("success", "Successfully updated");
                response.redirect("/campgrounds/" + request.params.id);
            }
        });
    });
});

// DESTROY ROUTE - deletes a campground from the database, if the user can
router.delete("/:id", Middleware.checkCampgroundOwnership, function(request, response){
    CampgroundDatabase.findByIdAndRemove(request.params.id, function(err){
        if (err) {
            request.flash("error", "Something went wrong");
            response.redirect("/campgrounds");
        }
        else {
            request.flash("success", "Deleted Campground");
            response.redirect("/campgrounds");
        }
    });
});

module.exports = router;