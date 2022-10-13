const { Schema, model, Types } = require("mongoose");

const reviewSchema = new Schema({
    listing: {
        type: Types.ObjectId,
        required: true,
        ref: "Listing",
    },
    author: {
        type: Types.ObjectId,
        required: true,
        ref: "User",
    },
    rating: Number,
    comment: String,
    datePosted: {
        type: Date,
        default: Date.now,
    },
});

const Review = model("Review", reviewSchema);

module.exports = Review;
