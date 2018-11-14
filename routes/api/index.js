const router = require("express").Router();
const usersRoutes = require("./users");
const db = require("../../models");

router.use("/users", usersRoutes);

router.get("/videos", function (req, res) {
  db.Video.find({}).populate("user").sort({ createdAt: -1 }).then(
    function(videos) {
      res.json({ videos });
    }).catch(err => {
    console.log(err);
    res.status(500).end();
  });
});

module.exports = router;
