const db = require("../models");

module.exports = {
  getVideos: function () {
    return db.Video.find({}).sort({
      createdAt: -1
    }).populate("user");
  },
  getVideo: async function (id) {
    const dbVideo = await db.Video.findById(id).populate(
      "user contentRecognition comments").exec();
    return db.User.populate(dbVideo, {
      path: "comments.user",
      select: "username"
    });
  },
  updateVideo: function (video) {
    const { user, title, description, fileName, s3Bucket } = video;
    return db.Video.findOneAndUpdate({ fileName }, {
      user,
      title,
      fileName,
      s3Bucket,
      description
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
  },
  deleteVideo: function (id) {
    return db.Video.findByIdAndRemove(id);
  },
  addVideoComment: function (videoId, commentId) {
    return db.Video.findByIdAndUpdate(videoId, {
      $push: { comments: commentId }
    }, { new: true }).populate("comments");
  }
};
