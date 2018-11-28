require("dotenv").config();
const router = require("express").Router();
const createError = require("http-errors");
const aws = require("aws-sdk");
const uuidv1 = require("uuid/v1");
const db = require("../../models");
const { amazon } = require("../../keys");

aws.config.region = "us-east-1";

const s3 = new aws.S3();

const rekognition = new aws.Rekognition({ apiVersion: "2016-06-27" });

function restrict(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).end();
}

function isValidMp4File(videoFile) {
  const { name, mimetype } = videoFile;
  return name.match(/\.(mp4|MP4)$/u) && mimetype === "video/mp4";
}

function isBlank(value) {
  return !(value && value.trim());
}

function isFormValid(data) {
  const { title, videoFile } = data;
  return videoFile && isValidMp4File(videoFile) && !isBlank(title);
}

function getFormError(data) {
  const { title, videoFile } = data;
  if (isBlank(title)) {
    return createError(400, "Title must not be empty.");
  } else if (!(videoFile && isValidMp4File(videoFile))) {
    return createError(415, "Invalid (.mp4) file.");
  }
}

function createOrUpdateVideo(video) {
  const { user, title, description, fileName, s3Bucket } = video;
  return db.Video.findOneAndUpdate({ fileName }, {
    user,
    title,
    fileName,
    s3Bucket,
    description
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

function addUserVideo(userId, videoId) {
  return db.User.findByIdAndUpdate(userId,
    { $addToSet: { videos: videoId } },
    { new: true }).populate("videos");
}

function createVideoContentRecognition(contentRecognition) {
  return db.VideoContentRecognition.create(contentRecognition);
}

function createOrUpdateContentRecognition(dbVideo, contentRecognition, fn) {
  if (dbVideo.contentRecognition) {
    db.VideoContentRecognition.findByIdAndUpdate(
      dbVideo.contentRecognition._id,
      contentRecognition,
      (err, dbContentRecognition) => {
        if (err) return fn(err);
        fn(null, dbContentRecognition);
      });
  } else {
    createVideoContentRecognition(contentRecognition).then(
      dbContentRecognition => {
        dbVideo.contentRecognition = dbContentRecognition._id;
        dbVideo.save(function (err) {
          if (err) return fn(err);
          fn(null, dbContentRecognition);
        });
      });
  }
}

function putObjectInS3StorageBucket(videoFile, fn) {
  s3.putObject({
    ACL: "public-read",
    Key: videoFile.name,
    Body: videoFile.data,
    Bucket: amazon.s3Bucket
  }, function (err) {
    if (err) console.log(err, err.stack);
    fn(err);
  });
}

function upload(video, fn) {
  const { user, title, description, fileName, videoFile } = video;
  if (isFormValid(video)) {
    createOrUpdateVideo({
      user,
      title,
      fileName,
      description,
      s3Bucket: amazon.s3Bucket
    }).then(function (dbVideo) {
      return addUserVideo(user, dbVideo._id);
    }).then(function (dbUser) {
      putObjectInS3StorageBucket(videoFile,
        err => {
          if (err) throw err;
          return fn(null, dbUser.videos);
        });
    });
  } else {
    fn(getFormError(video));
  }
}

function sendContentModerationRequest(dbVideo, contentRecognition, fn) {
  const params = {
    Video: {
      S3Object: {
        Bucket: dbVideo.s3Bucket,
        Name: dbVideo.fileName
      }
    },
    ClientRequestToken: contentRecognition.clientRequestToken,
    JobTag: contentRecognition.jobTag,
    MinConfidence: 50.0,
    NotificationChannel: {
      RoleArn: amazon.rekognitionRoleArn,
      SNSTopicArn: amazon.rekognitionTopicArn
    }
  }
  rekognition.startContentModeration(params, function (err, data) {
    if (data) {
      console.log(`Received data for JobId: ${data.JobId}.`);
      fn(null, data);
    } else {
      console.log(err, err.stack);
      fn(new Error("An error occurred. Error: ", err));
    }
  });
}

function sendRequestAndUpdateContentRecognition(dbVideo, fn) {
  const contentRecognition = {
    labels: [],
    jobTag: dbVideo._id.toString(),
    receivedLabelsAt: null,
    clientRequestToken: uuidv1()
  };
  sendContentModerationRequest(dbVideo, contentRecognition,
    (err, data) => {
      if (err) return fn(err);
      contentRecognition.jobId = data.JobId;
      createOrUpdateContentRecognition(dbVideo, contentRecognition,
        (error, dbContentRecognition) => {
          if (error) return fn(error);
          fn(null, dbContentRecognition);
        });
    });
}

router.post("/upload", restrict, function (req, res) {
  const user = req.user;
  const { title, description } = req.body;
  let fileName = "";
  let videoFile = null;
  if (req.files) {
    videoFile = req.files.file;
    fileName = `${user.username}_${videoFile.name}`;
    videoFile.name = fileName;
  }
  const video = { user, title, description, fileName, videoFile };
  upload(video, (err, videos) => {
    if (videos) {
      const dbVideo = videos.filter(v => v.fileName === fileName)[0];
      sendRequestAndUpdateContentRecognition(dbVideo,
        (error, dbContentRecognition) => {
          if (dbContentRecognition) {
            res.json(videos)
          } else {
            console.log(error);
            return res.status(500).end();
          }
        });
    } else {
      res.status(err.status).end();
    }
  });
});

module.exports = router;
