const mongoose = require("mongoose");

const { Schema } = mongoose;

const VideoSchema = new Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  contentRecognition: {
    type: Schema.Types.ObjectId,
    ref: "VideoContentRecognition"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
