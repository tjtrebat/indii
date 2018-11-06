const router = require("express").Router();
const path = require("path");
const usersRoutes = require("./users");

router.get("/", function (req, res) {
    res.render("index", {
        user: req.user
    });
});

router.use("/", usersRoutes);

router.use(function (req, res) {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

module.exports = router;
