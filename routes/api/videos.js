const router = require("express").Router();
const db = require("../../models");

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

function getVideo(id, fn) {
  db.Video.findById(id).populate("user").then(
    function (video) {
      fn(null, video);
    }
  ).catch(err => {
    fn(new Error("An error occurred. Error: ", err));
  });
}

router.get("/:videoId", function (req, res) {
  getVideo(req.params.videoId, (error, video) => {
    if (video) {
      res.json(video);
    } else {
      console.log(error);
      res.status(500).end();
    }
  });
});

module.exports = router;
