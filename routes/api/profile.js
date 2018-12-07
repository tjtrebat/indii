const router = require("express").Router();
const { profileController } = require("../../controllers");

function restrict(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).end();
}

router.post("/upload", restrict, profileController.uploadVideo);
router.delete("/videos/:videoId", restrict, profileController.deleteVideo);

module.exports = router;
