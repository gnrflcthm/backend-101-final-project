const { Schema, model, Types } = require("mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: String,
    listings: [{
        type: Types.ObjectId,
        ref: "Listing",
    }],
    reviews: [{
        type: Types.ObjectId,
        ref: "Review"
    }]
});

const User = model("User", userSchema);

module.exports = User;
