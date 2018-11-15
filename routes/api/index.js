const router = require("express").Router();
const usersRoutes = require("./users");
const db = require("../../models");

router.use("/users", usersRoutes);

router.get("/videos", function (req, res) {
  db.Video.find({}).populate("user").sort({ createdAt: -1 }).then(
    function (videos) {
      res.json({ videos });
    }).catch(err => {
    console.log(err);
    res.status(500).end();
  });
});

router.get("/videos/:username", function (req, res) {
  const username = req.params.username;
  console.log("Using username: ", username);
  db.User.findOne({ username }).populate("videos").then(
    function(dbUser) {
      res.json({ videos: dbUser.videos });
    }
  ).catch(err => {
    console.log(err);
    res.status(500).end();
  });
});

module.exports = router;
