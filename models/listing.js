const { Schema, model } = require("mongoose");

const listingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    uploader: {
        type: String,
        required: true,
    },
    description: String,
    address: String,
    datePosted: {
        type: Date,
        default: Date.now,
    },
    previewImage: String,
    xCoord: Number,
    yCoord: Number,
    pricing: Number,
    rating: Number,
});

const Listing = model("Listing", listingSchema);

module.exports = Listing;
