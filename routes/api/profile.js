require("dotenv").config();
const router = require("express").Router();
const aws = require("aws-sdk");
const uuidv1 = require("uuid/v1");
const db = require("../../models");
const { s3Bucket } = require("../../keys").amazon;

aws.config.region = "us-east-1";

const s3 = new aws.S3();

const rekognition = new aws.Rekognition({ apiVersion: "2016-06-27" });

function createOrUpdateVideo(video) {
  const { url, title, user } = video;
  return db.Video.findOneAndUpdate({ url }, {
    url,
    title,
    user
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

function restrict(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).end();
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
  const { user, title, videoFile, url } = video;
  createOrUpdateVideo({
    url,
    title,
    user
  }).then(function (dbVideo) {
    return addUserVideo(user, dbVideo._id);
  }).then(function (dbUser) {
    putObjectInS3StorageBucket(videoFile, s3Error => {
      if (s3Error) throw s3Error;
      return fn(null, dbUser.videos);
    });
  }).catch(function (err) {
    console.log(err);
    return fn(new Error("An error occurred. Error: ", err));
  });
}

function sendContentModerationRequest(fileName, contentRecognition, fn) {
  console.log(`Sending request for content moderation on '${fileName}'.`);
  const params = {
    Video: {
      S3Object: {
        Bucket: s3Bucket,
        Name: fileName
      }
    },
    ClientRequestToken: contentRecognition.clientRequestToken,
    JobTag: contentRecognition.jobTag,
    MinConfidence: 50.0,
    NotificationChannel: {
      RoleArn: "arn:aws:iam::772742774276:role/rekognition_role",
      SNSTopicArn: "arn:aws:sns:us-east-1:772742774276:AmazonRekognitionTopic"
    }
  }
  rekognition.startContentModeration(params, function (err, data) {
    if (data) {
      console.log(`Received JobId '${data.JobId}' for '${fileName}'.`);
      fn(null, data);
    } else {
      console.log(err, err.stack);
      fn(new Error("An error occurred. Error: ", err));
    }
  });
}

function sendRequestAndUpdateContentRecognition(fileName, dbVideo, fn) {
  const contentRecognition = {};
  contentRecognition.labels = [];
  contentRecognition.jobTag = uuidv1();
  contentRecognition.receivedLabelsAt = null;
  contentRecognition.clientRequestToken = uuidv1();
  sendContentModerationRequest(fileName, contentRecognition,
    (err, data) => {
      if (err) return fn(err);
      contentRecognition.jobId = data.JobId;
      if (dbVideo.contentRecognition) {
        db.VideoContentRecognition.findByIdAndUpdate(dbVideo.contentRecognition._id, contentRecognition,
          (error, dbContentRecognition) => {
            if (error) return fn(error);
            fn(null, dbContentRecognition);
          });
      } else {
        createVideoContentRecognition(contentRecognition).then(
          dbContentRecognition => {
            console.log("Updating dbVideo.");
            dbVideo.contentRecognition = dbContentRecognition._id;
            dbVideo.save(function (error) {
              if (error) return fn(error);
              fn(null, dbContentRecognition);
            });
          });
      }
    });
}

router.post("/upload", restrict, function (req, res) {
  const videoFile = req.files.file;
  const title = req.body.title.trim();
  const url = `https://s3.amazonaws.com/${s3Bucket}/${videoFile.name}`;
  const video = {
    user: req.user._id,
    title,
    videoFile,
    url
  }
  validateForm(video).then(() => {
    upload(video, (err, videos) => {
      if (err) throw err;
      const dbVideo = videos.filter(v => v.url === url)[0];
      sendRequestAndUpdateContentRecognition(videoFile.name, dbVideo, error => {
        if (error) throw error;
        res.json(videos);
      });
    });
  }).catch(err => {
    console.log(err);
    res.status(500).end();
  });
});

module.exports = router;
