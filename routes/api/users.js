require("dotenv").config();
const router = require("express").Router();
const passport = require("../../config/passport");
const { usersController } = require("../../controllers");

router.post("/login", passport.authenticate("local"),
  function (req, res) {
    res.json(req.user);
  });

router.get("/logout", function (req, res) {
  req.logout();
  res.status(200).end();
});

function register(username, password, fn) {
  usersController.getUserByUsername(
    username
  ).then(
    dbUser => {
      if (dbUser) return fn(new Error("User is already registered."));
      usersController.createUser({
        username,
        password
      }).then(user => {
        fn(null, user)
      }).catch(err => {
        fn(new Error("An error occurred. Error: ", err));
      });
    }).catch(err => fn(new Error("An error occurred. Error: ", err)));
}

router.post("/register", function (req, res) {
  const { username, password } = req.body;
  register(username, password, (error, user) => {
    if (user) {
      req.logIn(user, err => {
        if (err) throw err;
        res.json(user);
      });
    } else {
      console.log(error);
      res.status(400).end();
    }
  });
});

router.get("/getUserStatus", function (req, res) {
  const user = req.user;
  if (user) {
    usersController.getUser(
      user._id
    ).then(function (dbUser) {
      res.json(dbUser);
    }).catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
  } else {
    res.status(401).end();
  }
});

router.get("/logout", function (req, res) {
  req.logout();
  res.status(200).end();
});

function getUserVideos(username, fn) {
  usersController.getUserByUsername(
    username
  ).populate("videos").then(
    function (dbUser) {
      fn(null, dbUser.videos);
    }
  ).catch(err => {
    fn(new Error("An error occurred. Error: ", err));
  })
}

router.get("/videos/:username", function (req, res) {
  getUserVideos(req.params.username, (error, videos) => {
    if (videos) {
      res.json({ videos });
    } else {
      console.log(error);
      res.status(500).end();
    }
  });
});

module.exports = router;
