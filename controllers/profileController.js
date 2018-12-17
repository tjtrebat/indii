require("dotenv").config();

const aws = require("aws-sdk");
const uuidv1 = require("uuid/v1");
const createError = require("http-errors");
const db = require("../models");
const { amazon } = require("../keys");

aws.config.region = "us-east-1";

function updateVideo(video) {
  const { user, title, description, fileName, s3Bucket } = video;
  return db.Video.findOneAndUpdate({ fileName }, {
    user,
    title,
    fileName,
    s3Bucket,
    description
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

function createContentRecognition(contentRecognition) {
  return db.VideoContentRecognition.create(contentRecognition);
}

function updateContentRecognition(dbVideo, contentRecognition, fn) {
  if (dbVideo.contentRecognition) {
    db.VideoContentRecognition.findByIdAndUpdate(
      dbVideo.contentRecognition._id,
      contentRecognition,
      (err, dbContentRecognition) => {
        if (err) return fn(err);
        fn(null, dbContentRecognition);
      });
  } else {
    createContentRecognition(contentRecognition).then(
      dbContentRecognition => {
        dbVideo.contentRecognition = dbContentRecognition._id;
        dbVideo.save(function (err) {
          if (err) return fn(err);
          fn(null, dbContentRecognition);
        });
      });
  }
}

function addUserVideo(userId, videoId) {
  return db.User.findByIdAndUpdate(userId,
    { $addToSet: { videos: videoId } },
    { new: true }).populate("videos");
}

function removeVideo(id) {
  return db.Video.findByIdAndRemove(id);
}

function removeContentRecognition(id) {
  return db.VideoContentRecognition.findByIdAndRemove(id);
}

function deleteContentRecognitionLabels(labels) {
  return db.VideoContentRecognitionLabel.deleteMany({
    _id: { $in: labels }
  });
}

function removeUserVideo(userId, videoId) {
  return db.User.findByIdAndUpdate(userId, {
    $pull: { videos: videoId }
  }, { new: true }).populate("videos");
}

async function deleteVideo(userId, videoId) {
  const dbVideo = await removeVideo(videoId);
  const dbContentRecognition = await removeContentRecognition(
    dbVideo.contentRecognition);
  await deleteContentRecognitionLabels(
    dbContentRecognition.labels);
  const dbUser = await removeUserVideo(userId, videoId);
  return dbUser.videos;
}

const s3 = new aws.S3();

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

const rekognition = new aws.Rekognition({ apiVersion: "2016-06-27" });

function sendContentModerationRequest(dbVideo, contentRecognition, fn) {
  const { jobTag, clientRequestToken } = contentRecognition;
  const params = {
    JobTag: jobTag,
    MinConfidence: 50.0,
    Video: {
      S3Object: {
        Bucket: dbVideo.s3Bucket,
        Name: dbVideo.fileName
      }
    },
    ClientRequestToken: clientRequestToken,
    NotificationChannel: {
      RoleArn: amazon.rekognitionRoleArn,
      SNSTopicArn: amazon.rekognitionTopicArn
    }
  }
  rekognition.startContentModeration(params,
    function (err, data) {
      if (data) {
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
      updateContentRecognition(
        dbVideo, contentRecognition,
        (error, dbContentRecognition) => {
          if (error) return fn(error);
          fn(null, dbContentRecognition);
        });
    });
}

async function upload(video, fn) {
  const { user, title, description, fileName, videoFile } = video;
  const dbVideo = await updateVideo({
    user,
    title,
    fileName,
    description,
    s3Bucket: amazon.s3Bucket
  });
  const dbUser = await addUserVideo(user, dbVideo._id);
  putObjectInS3StorageBucket(videoFile,
    err => {
      if (err) return fn(err);
      sendRequestAndUpdateContentRecognition(dbVideo,
        (error, dbContentRecognition) => {
          if (dbContentRecognition) {
            fn(null, dbUser.videos);
          } else {
            console.log(error);
            fn(new Error("An error occurred. Error: ", error));
          }
        });

    });
}

module.exports = {
  uploadVideo: function (req, res) {
    const user = req.user;
    const { title, description } = req.body;
    const videoFile = req.files ? req.files.file : null;
    if (isFormValid({ title, videoFile })) {
      const fileName = `${user.username}_${videoFile.name}`;
      const video = { user, title, description, fileName, videoFile };
      videoFile.name = fileName;
      upload(video, (err, videos) => {
        if (videos) {
          res.json(videos);
        } else {
          console.log(err);
          res.status(500).end();
        }
      });
    } else {
      const formError = getFormError({ title, videoFile });
      res.status(formError.status).end();
    }
  },
  deleteVideo: function (req, res) {
    deleteVideo(
      req.user._id,
      req.params.videoId
    ).then(
      videos => res.json(videos)
    ).catch(err => {
      console.log(err);
      res.status(500).end();
    });
  }
};
