const mongoose = require("mongoose");

const { Schema } = mongoose;

const VideoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  contentRecognition: {
    type: Schema.Types.ObjectId,
    ref: "VideoContentRecognition"
  },
  isContentEligible: { type: Boolean },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
