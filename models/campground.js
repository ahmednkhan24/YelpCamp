var mongoose = require("mongoose");

// schema setup
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    desc: String,
    location: String,
    lat: Number,
    lng: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            // embed an id in the comments array as a reference to the comment
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

// compile the schema into a model
var campgroundDatabase = mongoose.model("Campground", campgroundSchema);

// when we require campground.js in other files, that file will be getting this model
module.exports = campgroundDatabase;