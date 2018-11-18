const router = require("express").Router();
const usersRoutes = require("./users");
const videosRoutes = require("./videos");
const profileRoutes = require("./profile");

router.use("/users", usersRoutes);
router.use("/videos", videosRoutes);
router.use("/profile", profileRoutes);

module.exports = router;
