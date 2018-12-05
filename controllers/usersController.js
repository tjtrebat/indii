const db = require("../models");

module.exports = {
  getUser: function (userId) {
    return db.User.findById(userId).populate("videos")
  },
  getUserByUsername: function (username) {
    return db.User.findOne({ username });
  },
  createUser: function (user) {
    return db.User.create(user);
  },
  addUserVideo: function (userId, videoId) {
    return db.User.findByIdAndUpdate(userId,
      { $addToSet: { videos: videoId } },
      { new: true }).populate("videos");
  },
  removeUserVideo: function (userId, videoId) {
    return db.User.findByIdAndUpdate(userId, {
      $pull: { videos: videoId }
    }, { new: true }).populate("videos");
  },
  populateComments: function (dbVideo, fn) {
    db.User.populate(dbVideo, {
      path: "comments.user",
      select: "username"
    }, (err, video) => {
      if (err) fn(err);
      fn(null, video);
    });
  }
};
