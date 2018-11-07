const router = require("express").Router();
const passport = require("../../config/passport");
const db = require("../../models");

router.post("/login", passport.authenticate("local"),
  function (req, res) {
    res.json(req.user);
  });

router.get("/logout", (req, res) => {
  req.logout();
  res.status(200).end();
});

function register(username, password, fn) {
  db.User.findOne({ username }).then(dbUser => {
    if (dbUser) {
      return fn(new Error("User already exists!"));
    }
    db.User.create({
      username: username,
      password: password
    }).then(user => fn(null, user)).catch(err => fn(new Error("An error occurred. Error: ", err)));
  }).catch(err => fn(new Error("An error occurred. Error: ", err)));
}

router.post("/register", (req, res) => {
  const { username, password, passwordConf } = req.body;
  if (password !== passwordConf) {
    return res.json({
      error: "Passwords do not match!"
    });
  }
  register(username, password, function (error, user) {
    if (user) {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.json(req.user);
      });
    } else {
      console.log(error);
      return res.json({
        error: error.message
      });
    }
  });
});

router.get("/getUserStatus", function (req, res) {
  if (req.user) {
    return res.json(req.user);
  }
  res.status(401).end();
});

router.get("/logout", function (req, res) {
  req.logout();
  res.status(200).end();
});

module.exports = router;
