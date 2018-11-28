const router = require("express").Router();
const aws = require("aws-sdk");
const db = require("../../models");

aws.config.region = "us-east-1";

const rekognition = new aws.Rekognition({ apiVersion: "2016-06-27" });

function getVideos(fn) {
  db.Video.find({}).sort({
    createdAt: -1
  }).populate("user").then(
    function (videos) {
      fn(null, videos);
    }
  ).catch(err => {
    fn(new Error("An error occurred. Error: ", err));
  });
}

function getVideo(id) {
  return db.Video.findById(id).populate("user contentRecognition");
}

function createVideoContentRecognitionLabels(labels) {
  return db.VideoContentRecognitionLabel.create(labels);
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
      fn(new Error(`An error occurred. JobStatus: ${data.JobStatus}`));
    }
  });
}

function requestLabelsAndSaveContentRecognition(contentRecognition, fn) {
  const { jobId } = contentRecognition;
  requestModerationLabels(jobId, (err, data) => {
    if (err) return fn(err);
    console.log(`Received labels (${data.length}) for JobId ${jobId}.`);
    createVideoContentRecognitionLabels(data).then(
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

router.get("/", function (req, res) {
  getVideos((err, videos) => {
    if (videos) {
      res.json(videos);
    } else {
      console.log(err);
      res.status(500).end();
    }
  });
});

router.get("/:videoId", function (req, res) {
  getVideo(req.params.videoId).then(video => {
    if (video) {
      const { contentRecognition } = video;
      if (contentRecognition) {
        if (contentRecognition.receivedLabelsAt) {
          db.VideoContentRecognitionLabel.populate(video, {
            path: "contentRecognition.labels"
          }, (err, dbVideo) => {
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
});

module.exports = router;
