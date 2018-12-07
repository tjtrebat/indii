const router = require("express").Router();
const { videosController } = require("../../controllers");

router.get("/", videosController.getVideos);
router.get("/:videoId", videosController.getVideo);

function restrict(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).end();
}

router.post("/:videoId", restrict, videosController.addUserComment);

module.exports = router;
