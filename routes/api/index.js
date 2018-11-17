const router = require("express").Router();
const usersRoutes = require("./users");
const videosRoutes = require("./videos");

router.use("/users", usersRoutes);
router.use("/videos", videosRoutes);

module.exports = router;
