require("dotenv").config();
const router = require("express").Router();
const aws = require("aws-sdk");
const db = require("../../models");
const { s3Bucket } = require("../../keys").amazon;

aws.config.region = "us-east-2";
const s3 = new aws.S3();

function restrict(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).end();
}

function createOrUpdateVideo(video) {
  const { url, title, user } = video;
  return db.Video.findOneAndUpdate({ url }, {
    title,
    url,
    user
  }, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });
}

function addUserVideo(userId, video) {
  return db.User.findByIdAndUpdate(userId,
    { $addToSet: { videos: video } },
    { new: true }).populate("videos");
}

function validateForm(data) {
  const { title, fileName } = data;
  const formErrors = [];
  if (!title.trim()) {
    formErrors.push(new Error("Title must not be empty."));
  } else if (!fileName.match(/\.(mp4|MP4)$/u)) {
    formErrors.push(new Error("Invalid file format."));
  }
  return formErrors;
}

function upload(videoData, fn) {
  const { title, fileName, data, user } = videoData;
  createOrUpdateVideo({
    url: `https://s3.us-east-2.amazonaws.com/${s3Bucket}/${fileName}`,
    title,
    user
  }).then(function(dbVideo) {
    return addUserVideo(user, dbVideo._id);
  }).then(function(dbUser) {
    s3.putObject({
      ACL: "public-read",
      Body: data,
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
  const videoFile = req.files.file;
  const videoData = {
    title: req.body.title.trim(),
    fileName: videoFile.name,
    data: videoFile.data,
    user: req.user._id
  }
  const formErrors = validateForm(videoData);
  if (formErrors.length === 0) {
    upload(videoData, (error, videos) => {
      if (videos) {
        res.json(videos);
      } else {
        console.log(error);
        res.status(500).end();
      }
    });
  } else {
    res.status(400).end();
  }
});

module.exports = router;
