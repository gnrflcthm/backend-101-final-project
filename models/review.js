const { Schema, model } = require("mongoose");

const reviewSchema = new Schema({
    listingId: {
        type: String,
        required: true,
    },
    authorId: {
        type: String,
        required: true,
    },
    authorUsername: String,
    rating: Number,
    comment: String,
    datePosted: {
        type: Date,
        default: Date.now,
    },
});

const Review = model("Review", reviewSchema);

module.exports= Review;
