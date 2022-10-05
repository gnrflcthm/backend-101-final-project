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
        res.user = jwt.decode(session.token);
    }

    next();
});

app.get("/", async (req, res) => {
    res.render("home", { isLoggedIn: !!res.user });
});

app.route("/signin")
    .get((req, res) => {
        res.render("signin", { isLoggedIn: !!res.user });
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
                )
                    .status(200)
                    .json({ message: "Success" });
            } else {
                res.render("signin", {
                    email,
                    error: "Invalid Login Credentials",
                });
            }
        } else {
            res.render("signin", { error: "User Does Not Exist." });
        }
    });

app.route("/signup")
    .get((req, res) => {
        res.render("signup", { isLoggedIn: !!res.user });
    })
    .post(async (req, res) => {
        const { username, email, password } = req.body;

        console.table(req.body);

        const user = new User({ username, email, password });

        try {
            await user.save();
            res.status(200);
        } catch (err) {
            console.log(err);
            res.status(418);
        }
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
        res.render("addlisting", { isLoggedIn: !!res.user });
    })
    .post((req, res) => {
        res.end();
    });

app.listen(PORT, (req, res) => {
    console.log(`App running at port ${PORT}`);
    console.log(`Visit at: http://localhost:${PORT}`);
});
