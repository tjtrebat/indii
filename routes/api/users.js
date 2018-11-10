require("dotenv").config();
const router = require("express").Router();
const aws = require("aws-sdk");
const passport = require("../../config/passport");
const db = require("../../models");
const { s3_bucket } = require("../../keys").amazon;

aws.config.region = "us-east-2";

const s3 = new aws.S3();

router.post("/login", passport.authenticate("local"),
  function (req, res) {
    res.json(req.user);
  });

router.get("/logout", function (req, res) {
  req.logout();
  res.status(200).end();
});

function register(username, password, fn) {
  db.User.findOne({ username }).then(dbUser => {
    if (dbUser) {
      return fn(new Error("User is already registered."));
    }
    db.User.create({
      username: username,
      password: password
    }).then(user => {
      fn(null, user)
    }).catch(err => {
      fn(new Error("An error occurred. Error: ", err));
    });
  }).catch(err => {
    fn(new Error("An error occurred. Error: ", err));
  });
}

router.post("/register", function (req, res) {
  const { username, password } = req.body;
  register(username, password, (error, user) => {
    if (user) {
      req.logIn(user, err => {
        if (err) throw err;
        res.json(req.user);
      });
    } else {
      console.log(error);
      res.status(400).end();
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

function restrict(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).end();
}

router.post("/upload", restrict, function (req, res) {
  const videoFile = req.files.file;
  console.log("Title: ", req.files.title);
  const fileName = `${req.user.username}_${videoFile.name}`;
  if (!fileName.endsWith(".mp4")) {
    return res.status(400).end();
  }
  s3.putObject({
    ACL: "public-read",
    Body: videoFile.data,
    Bucket: s3_bucket,
    Key: fileName
  }, function (err) {
    if (err) {
      console.log(err, err.stack);
      res.status(500).end();
    } else {
      res.json({
        url: `https://s3.us-east-2.amazonaws.com/${s3_bucket}/${fileName}`
      });
    }
  });
});

module.exports = router;
