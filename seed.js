const mongoose = require("mongoose");
const { User, Listing, Review } = require("./models");
const userData = require("./data/users.json");
const listingData = require("./data/listings.json");

require("dotenv").config();

mongoose.connect(process.env.DB_URL);

User.insertMany(userData, (err, res) => {
    if (err) console.log(err);
    for (let i = 0; i < listingData.length; i++) {
        let user;
        if (i < 3) {
            user = res[0];
        } else if (i < 6) {
            user = res[1];
        } else {
            user = res[2];
        }
        listingData[i].uploader = user._id;
    }
    Listing.insertMany(listingData, (err, res) => {
        if (err) console.log(err);
        console.log(res);
    })
});
