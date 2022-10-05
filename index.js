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

    res.render("home", { isLoggedIn: !!req.user, listings });
});

app.route("/signin")
    .get((req, res) => {
        res.render("signin", { isLoggedIn: !!req.user });
    })
    .post(async (req, res) => {
        const { email, password } = req.body;

        console.table(req.body);
        const user = await User.findOne({ email });

        if (user) {
            if (user.password === password) {
                const token = jwt.sign({ id: user.id }, process.env.SECRET);
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
        res.render("signup", { isLoggedIn: !!req.user });
    })
    .post(async (req, res) => {
        const { username, email, password } = req.body;

        console.table(req.body);

        try {
            const user = new User({ username, email, password });

            const exists = await User.findOne({ email });

            if (!exists) {
                const newUser = await user.save();
                const token = jwt.sign({ id: newUser.id }, process.env.SECRET);
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

app.route("/addlisting")
    .get((req, res) => {
        res.render("addlisting", { isLoggedIn: !!req.user });
    })
    .post(async (req, res) => {
        if (!req.user) {
            res.statusMessage = "You are not logged in";
            res.status(401).end();
            return;
        }

        console.table(req.body)

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
            // console.log(err);
            res.statusMessage = "Error in creating a new listing.";
            res.status(418);
        }

        res.end();
    });

app.listen(PORT, (req, res) => {
    console.log(`App running at port ${PORT}`);
    console.log(`Visit at: http://localhost:${PORT}`);
});
