const aws = require("aws-sdk");
const db = require("../models");

aws.config.region = "us-east-1";

const rekognition = new aws.Rekognition({
  apiVersion: "2016-06-27"
});

function getVideos() {
  return db.Video.find({}).sort({
    createdAt: -1
  }).populate("user");
}

function populateComments(video) {
  return db.User.populate(video, {
    path: "comments.user",
    select: "username"
  });
}

function addVideoComment(videoId, commentId) {
  return db.Video.findByIdAndUpdate(videoId, {
    $push: { comments: commentId }
  }, { new: true }).populate("comments");
}

function populateContentRecognitionLabels(video) {
  return db.VideoContentRecognitionLabel.populate(video, {
    path: "contentRecognition.labels"
  });
}

async function getVideo(id) {
  const dbVideo = await db.Video.findById(id).populate(
    "user contentRecognition comments").exec();
  await populateComments(dbVideo);
  await populateContentRecognitionLabels(dbVideo);
  return dbVideo;
}

function createContentRecognitionLabels(labels) {
  return db.VideoContentRecognitionLabel.create(labels);
}

function createComment(comment) {
  return db.Comment.create(comment);
}

function requestModerationLabels(jobId, fn) {
  rekognition.getContentModeration({
    JobId: jobId,
    MaxResults: 1000,
    SortBy: "TIMESTAMP"
  }, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      fn(new Error("An error occurred. Error: ", err));
    } else {
      fn(null, data);
    }
  });
}

function getModerationLabels(data) {
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
  return moderationLabels;
}

function requestLabelsAndSaveContentRecognition(contentRecognition, fn) {
  const { jobId } = contentRecognition;
  requestModerationLabels(jobId,
    (err, data) => {
      if (err) return fn(err);
      if (data.JobStatus === "SUCCEEDED") {
        createContentRecognitionLabels(
          getModerationLabels(data)
        ).then(
          dbLabels => {
            contentRecognition.labels = dbLabels;
            contentRecognition.receivedLabelsAt = Date.now();
            contentRecognition.save(function (error) {
              if (error) return fn(error);
              fn(null, contentRecognition);
            });
          });
      } else {
        console.log(`JobStatus: ${data.JobStatus}.`);
        fn();
      }
    });
}

module.exports = {
  getVideo: function (req, res) {
    getVideo(req.params.videoId).then(video => {
      const { contentRecognition } = video;
      if (contentRecognition.receivedLabelsAt) {
        if (contentRecognition.hasExplicitLabels()) {
          res.status(404).end();
        } else {
          res.json(video);
        }
      } else {
        requestLabelsAndSaveContentRecognition(contentRecognition,
          (err, dbContentRecognition) => {
            if (err) throw err;
            if (dbContentRecognition) {
              if (dbContentRecognition.hasExplicitLabels()) {
                res.status(404).end();
              } else {
                res.json(video);
              }
            } else {
              res.status(404).end();
            }
          }
        );
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
      return populateComments(dbVideo);
    }).then(function (dbVideo) {
      res.json(dbVideo);
    }).catch(err => {
      console.log(err);
      res.status(500).end();
    });
  }
};
