const router = require("express").Router();
const passport = require("../../config/passport");
const { usersController } = require("../../controllers");

router.get("/logout", usersController.logout);
router.post("/register", usersController.register);
router.get("/getUserStatus", usersController.getUserStatus);
router.get("/videos/:username", usersController.getUserVideos);
router.post("/login", passport.authenticate("local"), usersController.login);

module.exports = router;
