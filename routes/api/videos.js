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

router.get("/", function (req, res) {
  getVideos((error, videos) => {
    if (videos) {
      res.json(videos);
    } else {
      console.log(error);
      res.status(500).end();
    }
  });
});

function getVideo(id) {
  return db.Video.findById(id).populate("user contentRecognition");
}

function createVideoContentRecognitionLabels(labels) {
  return db.VideoContentRecognitionLabel.create(labels);
}

function saveVideoContentRecognition(contentRecognition, fn) {
  contentRecognition.save(function (err) {
    if (err) return fn(new Error("An error occurred. Error: ", err));
    fn(null, contentRecognition);
  });
}

function requestModerationLabels(jobId, fn) {
  console.log(`Requesting content moderation labels for JobId: ${jobId}.`);
  rekognition.getContentModeration({
    JobId: jobId,
    MaxResults: 1000,
    SortBy: "TIMESTAMP"
  }, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      fn(new Error("An error occurred. Error: ", err));
    } else {
      const { JobStatus: jobStatus } = data;
      console.log("JobStatus: ", jobStatus);
      if (jobStatus === "SUCCEEDED") {
        const moderationLabels = [];
        data.ModerationLabels.forEach(el => {
          const { ModerationLabel: moderationLabel } = el;
          const { Name: name, Confidence: confidence,
            Timestamp: timestamp, ParentName: parentName } = moderationLabel;
          moderationLabels.push({
            name,
            confidence,
            timestamp,
            parentName
          });
        });
        fn(null, { moderationLabels });
      } else {
        fn(new Error("An error occurred retrieving the labels."));
      }
    }
  });
}

router.get("/:videoId", function (req, res) {
  getVideo(req.params.videoId).then(video => {
    if (video) {
      const { contentRecognition } = video;
      if (contentRecognition) {
        if (contentRecognition.receivedLabelsAt) {
          db.VideoContentRecognitionLabel.populate(video, {
            path: "contentRecognition.labels"
          }, (err, dbVideo) => {
            if (err) return res.status(404).end();
            if (dbVideo.contentRecognition.hasExplicitLabels()) {
              console.log("Video is moderated for explicit content.");
              res.status(404).end();
            } else {
              res.json(video);
            }
          });
        } else {
          requestModerationLabels(contentRecognition.jobId,
            (error, data) => {
              if (data) {
                if (data.moderationLabels) {
                  createVideoContentRecognitionLabels(data.moderationLabels).then(
                    dbLabels => {
                      contentRecognition.labels = dbLabels;
                      contentRecognition.receivedLabelsAt = Date.now();
                      saveVideoContentRecognition(contentRecognition,
                        (err, dbContentRecognition) => {
                          if (err) throw err;
                          if (dbContentRecognition.hasExplicitLabels()) {
                            res.status(404).end();
                          } else {
                            res.json(video);
                          }
                        });
                    });
                } else {
                  res.json(video);
                }
              } else {
                console.log(error);
                res.status(404).end();
              }
            });
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
