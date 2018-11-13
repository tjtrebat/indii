const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const db = require("../models");

passport.use(new LocalStrategy((username, password, done) => {
  db.User.findOne({
    username: username
  }).populate("videos").then(dbUser => {
    if (!dbUser) {
      return done(null, false, {
        message: "Incorrect email."
      });
    } else if (!dbUser.validPassword(password)) {
      return done(null, false, {
        message: "Invalid password."
      });
    }
    return done(null, dbUser);
  });
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

module.exports = passport;
