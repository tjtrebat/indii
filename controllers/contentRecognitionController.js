const db = require("../models");

module.exports = {
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
  }
};
