require("dotenv").config();

const router = require("express").Router();
const createError = require("http-errors");
const aws = require("aws-sdk");
const uuidv1 = require("uuid/v1");
const { amazon } = require("../../keys");
const videosController = require("../../controllers/videosController");

aws.config.region = "us-east-1";

const s3 = new aws.S3();

const rekognition = new aws.Rekognition({ apiVersion: "2016-06-27" });

function restrict(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).end();
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
      videosController.updateContentRecognition(dbVideo, contentRecognition,
        (error, dbContentRecognition) => {
          if (error) return fn(error);
          fn(null, dbContentRecognition);
        });
    });
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
  videosController.updateVideo({
    user,
    title,
    fileName,
    description,
    s3Bucket: amazon.s3Bucket
  }).then(function (dbVideo) {
    return videosController.addUserVideo(user, dbVideo._id);
  }).then(function (dbUser) {
    putObjectInS3StorageBucket(videoFile,
      err => {
        if (err) return fn(err);
        return fn(null, dbUser.videos);
      });
  });
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
  } else if (!videoFile || !isValidMp4File(videoFile)) {
    return createError(415, "Invalid (.mp4) file.");
  }
}

router.post("/upload", restrict, function (req, res) {
  const user = req.user;
  const { title, description } = req.body;
  const videoFile = req.files ? req.files.file : null;
  if (isFormValid({ title, videoFile })) {
    const fileName = `${user.username}_${videoFile.name}`;
    const video = { user, title, description, fileName, videoFile };
    videoFile.name = fileName;
    upload(video, (err, videos) => {
      if (videos) {
        const dbVideo = videos.filter(v => v.fileName === fileName)[0];
        sendRequestAndUpdateContentRecognition(dbVideo,
          (error, dbContentRecognition) => {
            if (dbContentRecognition) {
              res.json(videos)
            } else {
              console.log(error);
              res.status(500).end();
            }
          });
      } else {
        console.log(err);
        res.status(500).end();
      }
    });
  } else {
    const formError = getFormError({ title, videoFile });
    res.status(formError.status).end();
  }
});

module.exports = router;
