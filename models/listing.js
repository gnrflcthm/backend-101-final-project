const { Schema, model, Types } = require("mongoose");

const listingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    uploader: {
        type: Types.ObjectId,
        required: true,
        ref: "User",
    },
    description: String,
    address: String,
    datePosted: {
        type: Date,
        default: Date.now,
    },
    reviews: [
        {
            type: Types.ObjectId,
            ref: "Review",
        },
    ],
    previewImage: String,
    longitude: Number,
    latitude: Number,
    pricing: Number,
    tags: [
        {
            type: String,
            lowercase: true,
            validator: function () {
                return this.tags.length < 3;
            },
        },
    ],
});

listingSchema.methods.getAverageRating = function () {
    if (this.populated("reviews")) {
        const average =
            this.reviews
                .map((review) => review.rating)
                .reduce((sum, current) => sum + current, 0) /
            this.reviews.length;
        return isNaN(average) ? 0 : average;
    }

    return 0;
};

const Listing = model("Listing", listingSchema);

module.exports = Listing;
