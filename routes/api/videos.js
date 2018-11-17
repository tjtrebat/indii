const router = require("express").Router();
const db = require("../../models");

function getVideos(fn) {
  db.Video.find({}).populate("user").sort({ createdAt: -1 }).then(
    function (videos) {
      fn(videos);
    }
  ).catch(err => {
    fn(null, new Error("An error occurred. Error: ", err));
  });
}

router.get("/", function (req, res) {
  getVideos(function (videos, err) {
    if (videos) {
      res.json({ videos });
    } else {
      console.log(err);
      res.status(500).end();
    }
  });
});

function getUserVideos(username, fn) {
  db.User.findOne({ username }).populate("videos").then(
    function (dbUser) {
      fn(dbUser.videos);
    }
  ).catch(err => {
    fn(null, new Error("An error occurred. Error: ", err));
  })
}

router.get("/:username", function (req, res) {
  getUserVideos(req.params.username, function (videos, err) {
    if (videos) {
      res.json({ videos });
    } else {
      console.log(err);
      res.status(500).end();
    }
  });
});

module.exports = router;
