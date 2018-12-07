const aws = require("aws-sdk");
const db = require("../models");

function getVideos() {
  return db.Video.find({}).sort({
    createdAt: -1
  }).populate("user");
}

async function getVideo(id) {
  const dbVideo = await db.Video.findById(id).populate(
    "user contentRecognition comments").exec();
  return db.User.populate(dbVideo, {
    path: "comments.user",
    select: "username"
  });
}

function populateComments(dbVideo, fn) {
  db.User.populate(dbVideo, {
    path: "comments.user",
    select: "username"
  }, (err, video) => {
    if (err) fn(err);
    fn(null, video);
  });
}

function addVideoComment(videoId, commentId) {
  return db.Video.findByIdAndUpdate(videoId, {
    $push: { comments: commentId }
  }, { new: true }).populate("comments");
}

function populateContentRecognitionLabels(video, fn) {
  db.VideoContentRecognitionLabel.populate(video, {
    path: "contentRecognition.labels"
  }, (err, dbVideo) => {
    if (err) return fn(err);
    fn(null, dbVideo);
  });
}

function createContentRecognitionLabels(labels) {
  return db.VideoContentRecognitionLabel.create(labels);
}

function createComment(comment) {
  return db.Comment.create(comment);
}

aws.config.region = "us-east-1";

const rekognition = new aws.Rekognition({ apiVersion: "2016-06-27" });

function requestModerationLabels(jobId, fn) {
  rekognition.getContentModeration({
    JobId: jobId,
    MaxResults: 1000,
    SortBy: "TIMESTAMP"
  }, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      fn(new Error("An error occurred. Error: ", err));
    } else if (data.JobStatus === "SUCCEEDED") {
      const moderationLabels = [];
      data.ModerationLabels.forEach(el => {
        const { ModerationLabel: moderationLabel } = el;
        const { Name: name, Confidence: confidence,
          Timestamp: timestamp, ParentName: parentName } = moderationLabel;
        moderationLabels.push({
          name,
          timestamp,
          confidence,
          parentName
        });
      });
      fn(null, moderationLabels);
    } else {
      fn(new Error(`JobStatus: ${data.JobStatus}`));
    }
  });
}

function requestLabelsAndSaveContentRecognition(contentRecognition, fn) {
  const { jobId } = contentRecognition;
  requestModerationLabels(jobId,
    (err, data) => {
      if (err) return fn(err);
      createContentRecognitionLabels(data).then(
        dbLabels => {
          contentRecognition.labels = dbLabels;
          contentRecognition.receivedLabelsAt = Date.now();
          contentRecognition.save(function (error) {
            if (error) return fn(error);
            fn(null, contentRecognition);
          });
        });
    });
}

module.exports = {
  getVideo: function (req, res) {
    getVideo(req.params.videoId).then(video => {
      if (video) {
        const { contentRecognition } = video;
        if (contentRecognition) {
          if (contentRecognition.receivedLabelsAt) {
            populateContentRecognitionLabels(
              video, (err, dbVideo) => {
                if (err) throw err;
                if (dbVideo.contentRecognition.hasExplicitLabels()) {
                  res.status(404).end();
                } else {
                  res.json(video);
                }
              });
          } else {
            requestLabelsAndSaveContentRecognition(contentRecognition,
              (err, dbContentRecognition) => {
                if (dbContentRecognition) {
                  if (dbContentRecognition.hasExplicitLabels()) {
                    res.status(404).end();
                  } else {
                    res.json(video);
                  }
                } else {
                  console.log(err);
                  res.status(404).end();
                }
              }
            );
          }
        } else {
          res.status(404).end();
        }
      } else {
        res.status(404).end();
      }
    }).catch(err => {
      console.log(err);
      res.status(500).end();
    });
  },
  getVideos: function (req, res) {
    getVideos().then(videos => {
      res.json(videos);
    }).catch(err => {
      console.log(err);
      res.status(500).end();
    });
  },
  addUserComment: function (req, res) {
    createComment({
      user: req.user._id,
      text: req.body.text.trim()
    }).then(function (dbComment) {
      return addVideoComment(req.params.videoId, dbComment._id);
    }).then(function (dbVideo) {
      populateComments(dbVideo, (err, video) => {
        if (err) throw err;
        res.json(video);
      });
    }).catch(err => {
      console.log(err);
      res.status(500).end();
    });
  }
};
