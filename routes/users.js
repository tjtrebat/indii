const router = require("express").Router();
const passport = require("../config/passport");
const db = require("../models");

router.get("/login", (req, res) => {
    res.render("login", {
        error: req.query.login_error
    });
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?login_error=1"
}));

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    const confPassword = req.body.conf_password.trim();
    if (!(password === confPassword)) {
        return res.render("register", {
            error: "Passwords must match!"
        });
    }
    db.User.create({
        username: username,
        password: password
    }).then(user => {
        req.logIn(user, err => {
            if (err) throw err;
            res.redirect("/");
        });
    }).catch(err => {
        console.log(err);
        res.render("register", {
            error: err
        });
    });
});

module.exports = router;
