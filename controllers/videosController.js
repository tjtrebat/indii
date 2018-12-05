const db = require("../models");

const videosController = {
  getVideos: function (fn) {
    db.Video.find({}).sort({
      createdAt: -1
    }).populate("user").then(
      function (videos) {
        fn(null, videos);
      }
    ).catch(err => {
      fn(new Error("An error occurred. Error: ", err));
    });
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
  createContentRecognition: function (contentRecognition) {
    return db.VideoContentRecognition.create(contentRecognition);
  },
  updateContentRecognition: function (dbVideo, contentRecognition, fn) {
    if (dbVideo.contentRecognition) {
      db.VideoContentRecognition.findByIdAndUpdate(
        dbVideo.contentRecognition._id,
        contentRecognition,
        (err, dbContentRecognition) => {
          if (err) return fn(err);
          fn(null, dbContentRecognition);
        });
    } else {
      this.createContentRecognition(contentRecognition).then(
        dbContentRecognition => {
          dbVideo.contentRecognition = dbContentRecognition._id;
          dbVideo.save(function (err) {
            if (err) return fn(err);
            fn(null, dbContentRecognition);
          });
        });
    }
  },
  deleteContentRecognition: function (id) {
    return db.VideoContentRecognition.findByIdAndRemove(id);
  },
  createContentRecognitionLabels: function (labels) {
    return db.VideoContentRecognitionLabel.create(labels);
  },
  populateContentRecognitionLabels: function (video, fn) {
    db.VideoContentRecognitionLabel.populate(video, {
      path: "contentRecognition.labels"
    }, (err, dbVideo) => {
      if (err) return fn(err);
      fn(null, dbVideo);
    });
  },
  deleteContentRecognitionLabels: function (labels, fn) {
    db.VideoContentRecognitionLabel.deleteMany({
      _id: { $in: labels }
    }, function (err) {
      if (err) return fn(err);
      fn(null);
    });
  },
  createComment: function (comment) {
    return db.Comment.create(comment);
  },
  addVideoComment: function (videoId, commentId) {
    return db.Video.findByIdAndUpdate(videoId, {
      $push: { comments: commentId }
    }, { new: true }).populate("comments");
  },
  populateUserComments: function (dbVideo, fn) {
    db.User.populate(dbVideo, {
      path: "comments.user",
      select: "username"
    }, (err, video) => {
      if (err) fn(err);
      fn(null, video);
    });
  }
}

module.exports = videosController;
