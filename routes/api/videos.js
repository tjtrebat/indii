const router = require("express").Router();
const aws = require("aws-sdk");
const videosController = require("../../controllers/videosController");

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
  requestModerationLabels(jobId, (err, data) => {
    if (err) return fn(err);
    console.log(`Received labels (${data.length}) for JobId ${jobId}.`);
    videosController.createContentRecognitionLabels(data).then(
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
  videosController.getVideos((err, videos) => {
    if (videos) {
      res.json(videos);
    } else {
      console.log(err);
      res.status(500).end();
    }
  });
});

router.get("/:videoId", function (req, res) {
  videosController.getVideo(req.params.videoId).then(video => {
    if (video) {
      const { contentRecognition } = video;
      if (contentRecognition) {
        if (contentRecognition.receivedLabelsAt) {
          videosController.populateContentRecognitionLabels(video,
            (err, dbVideo) => {
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

router.delete("/:videoId", function (req, res) {
  videosController.deleteVideo(req.params.videoId).then(
    dbVideo => {
      videosController.deleteContentRecognition(dbVideo.contentRecognition).then(
        dbContentRecognition => {
          videosController.deleteContentRecognitionLabels(dbContentRecognition.labels,
            err => {
              if (err) throw err;
              videosController.removeUserVideo(req.user._id, dbVideo._id).then(
                dbUser => {
                  res.json(dbUser.videos)
                }
              )
            }
          )
        }
      )
    }
  ).catch(err => {
    console.log(err);
    res.status(500).end();
  });
});

router.post("/:videoId", function (req, res) {
  videosController.createComment({
    user: req.user._id,
    text: req.body.text.trim()
  }).then(function (dbComment) {
    return videosController.addVideoComment(req.params.videoId, dbComment._id);
  }).then(function (dbVideo) {
    videosController.populateUserComments(dbVideo, (err, video) => {
      if (err) throw err;
      res.json(video);
    });
  }).catch(err => {
    console.log(err);
    res.status(500).end();
  });
});

module.exports = router;
