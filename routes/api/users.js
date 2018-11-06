const router = require("express").Router();
const passport = require("../../config/passport");
const db = require("../../models");

router.post("/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
});

router.get("/logout", (req, res) => {
    req.logout();
    res.status(200).end();
});

router.post("/register", (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    const confirmPassword = req.body.confirmPassword.trim();
    if (!(password === confirmPassword)) {
        return res.json({
            err: "Passwords do not match!"
        });
    }
    db.User.create({
        username: username,
        password: password
    }).then(user => {
        req.logIn(user, err => {
            if (err) throw err;
            res.json(req.user);
        });
    }).catch(err => {
        console.log(err);
        res.status(500).end();
    });
});

router.get("/getUserStatus", function (req, res) {
    if (req.user) {
        return res.json(req.user);
    }
    res.status(401).end();
});

module.exports = router;