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
    rating: Number,
    comment: String,
});

const Review = model("Review", reviewSchema);

module.exports= Review;
