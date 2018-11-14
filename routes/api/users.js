require("dotenv").config();
const router = require("express").Router();
const aws = require("aws-sdk");
const passport = require("../../config/passport");
const db = require("../../models");
const { s3Bucket } = require("../../keys").amazon;

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
        res.json(user);
      });
    } else {
      console.log(error);
      res.status(400).end();
    }
  });
});

router.get("/getUserStatus", function (req, res) {
  if (req.user) {
    db.User.findById(req.user._id).populate("videos").then(
      function (user) {
        res.json(user);
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

function restrict(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).end();
}

function uploadVideo(videoFile, title, user, fn) {
  const fileName = `${user.username}_${videoFile.name}`;
  if (!fileName.endsWith(".mp4")) {
    return fn(new Error("Invalid file format!"));
  }
  const videoUrl = `https://s3.us-east-2.amazonaws.com/${s3Bucket}/${fileName}`;
  db.Video.findOneAndUpdate({
    url: videoUrl
  }, {
    title: title,
    url: videoUrl,
    user: user._id
  }, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  }).then(function(video) {
    return db.User.findByIdAndUpdate(user._id,
      { $addToSet: { videos: video._id } },
      { new: true }).populate("videos");
  }).then(function(dbUser) {
    console.log("Uploading to S3");
    s3.putObject({
      ACL: "public-read",
      Body: videoFile.data,
      Bucket: s3Bucket,
      Key: fileName
    }, function (err) {
      if (err) throw err;
      return fn(null, dbUser.videos);
    });
  }).catch(function (err) {
    return fn(new Error("An error occurred. Error: ", err));
  });
}

router.post("/upload", restrict, function (req, res) {
  uploadVideo(req.files.file, req.body.title, req.user,
    (err, videos) => {
      if (videos) {
        res.json(videos);
      } else {
        console.log(err);
        res.status(500).end();
      }
    });
});

module.exports = router;
