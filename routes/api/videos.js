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
      res.json({ videos });
    } else {
      console.log(error);
      res.status(500).end();
    }
  });
});

function receiveContentModerationResponse(jobId, fn) {
  console.log(`Retrieving content moderation for JobId: ${jobId}.`);
  const jobParams = {
    JobId: jobId,
    MaxResults: 1000,
    SortBy: "TIMESTAMP"
  };
  rekognition.getContentModeration(jobParams, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      fn(new Error("An error occurred. Error: ", err));
    } else {
      const { JobStatus: jobStatus } = data;
      const moderationLabels = [];
      if (jobStatus === "SUCCEEDED") {
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
      }
      fn(null, { jobStatus, moderationLabels });
    }
  });
}

function getVideo(id) {
  return db.Video.findById(id).populate("user contentRecognition");
}

function createVideoContentRecognitionLabels(labels) {
  return db.VideoContentRecognitionLabel.create(labels);
}

function saveVideoContentRecognition(video, fn) {
  const { contentRecognition } = video;
  contentRecognition.save(function (err) {
    if (err) throw err;
    video.save(function (error) {
      if (error) throw error;
      fn(null, video);
    });
  });
}

router.get("/:videoId", function (req, res) {
  getVideo(req.params.videoId).then(video => {
    if (video && video.isContentEligible) {
      res.json(video);
    } else if (video) {
      const { contentRecognition } = video;
      if (contentRecognition.jobSucceedAt) {
        res.status(404).end();
      } else {
        receiveContentModerationResponse(contentRecognition.jobId,
          (error, data) => {
            if (data) {
              console.log("JobStatus: ", data.jobStatus);
              if (data.jobStatus === "SUCCEEDED") {
                createVideoContentRecognitionLabels(data.moderationLabels).then(
                  labels => {
                    contentRecognition.labels = labels;
                    contentRecognition.jobSucceedAt = Date.now();
                    video.isContentEligible = !contentRecognition.isContentExplicit();
                    console.log("Eligible?: ", video.isContentEligible);
                    saveVideoContentRecognition(video, err => {
                      if (err) throw err;
                      if (video.isContentEligible) {
                        res.json(video);
                      } else {
                        res.status(404).end();
                      }
                    });
                  });
              }
            } else {
              console.log(error);
              res.status(404).send(error);
            }
          });
      }
    }
  }).catch(err => {
    console.log(err);
    res.status(500).send(err);
  });
});

module.exports = router;
