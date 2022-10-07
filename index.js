const path = require("path");
const dotenv = require("dotenv");

const { User, Listing, Review } = require("./models");
const mongoose = require("mongoose");
dotenv.config();

mongoose.connect(process.env.DB_URL);
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use((req, res, next) => {
    const session = cookie.parse(req.headers?.cookie || "");
    if (session.token) {
        req.user = jwt.decode(session.token);
    }
    next();
});

app.get("/", async (req, res) => {
    const listings = await Listing.find();

    res.render("home", { user: req.user, listings });
});

app.route("/signin")
    .get((req, res) => {
        res.render("signin", { user: req.user });
    })
    .post(async (req, res) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user) {
            if (user.password === password) {
                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    process.env.SECRET
                );
                res.setHeader(
                    "Set-Cookie",
                    cookie.serialize("token", token, {
                        httpOnly: true,
                        sameSite: true,
                    })
                ).status(200);
                res.statusMessage = "Signed In Successfully";
            } else {
                res.status(401);
                res.statusMessage = "Invalid Login Credentials";
            }
        } else {
            res.status(401);
            res.statusMessage = "User does not exist.";
        }
        res.end();
    });

app.route("/signup")
    .get((req, res) => {
        res.render("signup", { user: req.user });
    })
    .post(async (req, res) => {
        const { username, email, password } = req.body;

        try {
            const user = new User({ username, email, password });

            const exists = await User.findOne({ email });

            if (!exists) {
                const newUser = await user.save();
                const token = jwt.sign(
                    { id: newUser.id, username: newUser.username },
                    process.env.SECRET
                );
                res.setHeader(
                    "Set-Cookie",
                    cookie.serialize("token", token, {
                        httpOnly: true,
                        sameSite: true,
                    })
                ).status(200);
                res.statusMessage = "Account Created Successfully";
            } else {
                res.statusMessage = "Email already in use.";
                res.status(400);
            }
        } catch (err) {
            console.log("Error at signup.");
            res.statusMessage = "Error while creating account.";
            res.status(418);
        }
        res.end();
    });

app.get("/signout", (req, res) => {
    res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", "", {
            expires: new Date(0),
        })
    )
        .status(200)
        .redirect("/");
});

app.route("/listing/add")
    .get((req, res) => {
        res.render("addlisting", { user: req.user });
    })
    .post(async (req, res) => {
        if (!req.user) {
            res.statusMessage = "You are not logged in";
            res.status(401).end();
            return;
        }

        const listing = new Listing({
            ...req.body,
            uploader: req.user.id,
            datePosted: new Date(),
            rating: 0,
        });

        try {
            await listing.save();
            res.statusMessage = "Listing created successfully";
            res.status(200);
        } catch (err) {
            res.statusMessage = "Error in creating a new listing.";
            res.status(418);
        }

        res.end();
    });

app.get("/listing/current", async (req, res) => {
    if (!req.user) {
        res.status(302);
        res.redirect("/");
        return;
    }
    const listings = await Listing.find({ uploader: req.user.id });

    res.render("mylistings", { listings, user: req.user });
});

app.get("/listing/:id/edit", async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        res.redirect("404");
        return;
    }

    res.render("edit", { listing, user: req.user });
});

app.route("/listing/:id")
    .get(async (req, res) => {
        const { id } = req.params;

        const listing = await Listing.findById(id);

        res.render("listing", { ...listing, user: req.user });
    })
    .delete(async (req, res) => {
        const { id } = req.params;

        try {
            const listing = await Listing.findByIdAndDelete(id).exec();

            if (listing) {
                console.log(`Deleted Listing: ${id}`);
                res.statusMessage = "Listing Deleted Successfully";
                res.status(200);
            } else {
                res.statusMessage = "Nothing was deleted.";
            }
        } catch (err) {
            console.log(err);
            res.statusMessage =
                res.statusMessage || "Error In Deleting Listing";
            res.status(401);
        }
        res.end();
    })
    .patch(async (req, res) => {
        const { id } = req.params;
        const { name, address, pricing, previewImage, description } = req.body;

        const listing = await Listing.findById(id);

        try {
            if (listing) {
                listing.name = name;
                listing.address = address;
                listing.pricing = pricing;
                listing.previewImage = previewImage;
                listing.description = description;
                await listing.save();

                res.statusMessage = "Listing Updated Successfully";
                res.status(200);
            } else {
                res.statusMessage = "Listing Not Found";
                throw new Error("Listing not Found");
            }
        } catch (err) {
            console.log(err);
            res.statusMessage =
                res.statusMessage ||
                "An Error Has Occured while updating Listing.";
            res.status(401);
        }
        res.end();
    });

app.listen(PORT, (req, res) => {
    console.log(`App running at port ${PORT}`);
    console.log(`Visit at: http://localhost:${PORT}`);
});
