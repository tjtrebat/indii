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
    url,
    title,
    user
  }, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });
}

function addUserVideo(userId, videoId) {
  return db.User.findByIdAndUpdate(userId,
    { $addToSet: { videos: videoId } },
    { new: true }).populate("videos");
}

function isValidMp4File(videoFile) {
  const { name, mimetype } = videoFile;
  return name.match(/\.(mp4|MP4)$/u) && mimetype === "video/mp4";
}

function isBlank(value) {
  return !(value && value.trim());
}

function validateForm(data) {
  const { title, videoFile } = data;
  return new Promise((resolve, reject) => {
    if (isBlank(title)) {
      reject(new Error("Title must not be empty."));
    } else if (!isValidMp4File(videoFile)) {
      reject(new Error("Invalid (.mp4) file."));
    } else {
      resolve();
    }
  });
}

function putObjectInS3StorageBucket(videoFile, fn) {
  s3.putObject({
    ACL: "public-read",
    Body: videoFile.data,
    Bucket: s3Bucket,
    Key: videoFile.name
  }, function (err) {
    if (err) console.log(err, err.stack);
    fn(err);
  });
}

function upload(video, fn) {
  const { user, title, videoFile } = video;
  const fileName = videoFile.name;
  createOrUpdateVideo({
    url: `https://s3.us-east-2.amazonaws.com/${s3Bucket}/${fileName}`,
    title,
    user
  }).then(function (dbVideo) {
    return addUserVideo(user, dbVideo._id);
  }).then(function (dbUser) {
    putObjectInS3StorageBucket(videoFile, err => {
      if (err) throw err;
      return fn(null, dbUser.videos);
    });
  }).catch(function (err) {
    return fn(new Error("An error occurred. Error: ", err));
  });
}

router.post("/upload", restrict, function (req, res) {
  const videoFile = req.files.file;
  const title = req.body.title.trim();
  const video = {
    user: req.user._id,
    title,
    videoFile
  }
  validateForm(video).then(() => {
    upload(video, (error, videos) => {
      if (videos) {
        res.json(videos);
      } else {
        console.log(error);
        res.status(500).send(error);
      }
    })
  }).catch(err => {
    res.status(400).send(err);
  });
});

module.exports = router;
