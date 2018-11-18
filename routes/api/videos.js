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

function getUserVideos(username, fn) {
  db.User.findOne({
    username
  }).populate("videos").then(
    function (dbUser) {
      fn(null, dbUser.videos);
    }
  ).catch(err => {
    fn(new Error("An error occurred. Error: ", err));
  })
}

router.get("/:username", function (req, res) {
  getUserVideos(req.params.username, (error, videos) => {
    if (videos) {
      res.json({ videos });
    } else {
      console.log(error);
      res.status(500).end();
    }
  });
});

module.exports = router;
